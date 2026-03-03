package com.example.demo.service;

import com.example.demo.entity.ClientEntity;
import com.example.demo.entity.RentalEntity;
import com.example.demo.entity.ToolEntity;
import com.example.demo.repository.RentalRepository;
import com.example.demo.repository.ToolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

// ENDPOINT LOGIC: The Core Engine.
// Why: Orchestrates the entire lifecycle of a rental, coordinating between Client (for eligibility),
// Tools (for stock availability), and Kardex (for auditing). It acts as the "Traffic Controller".
@Service
public class RentalService {

    private final RentalRepository rentalRepo;
    private final ToolRepository toolRepository;
    private final ClientService clientService;
    private final ToolService toolService;
    private final KardexService kardexService;

    // Why: Constructor Injection is preferred over @Autowired on fields because it makes testing easier
    // (you can pass mock services manually without Spring context) and enforces dependencies at compile time.
    @Autowired
    public RentalService(RentalRepository rentalRepo,
                         ToolRepository toolRepository,
                         ClientService clientService,
                         ToolService toolService,
                         KardexService kardexService) {
        this.rentalRepo = rentalRepo;
        this.toolRepository = toolRepository;
        this.clientService = clientService;
        this.toolService = toolService;
        this.kardexService = kardexService;
    }

    /**
     * ENDPOINT ACTION: Creates the rental contract.
     * Transactional: Ensures that if Kardex logging fails, the whole rental is cancelled (Rollback).
     */
    @Transactional
    public RentalEntity createRental(String clientRut, List<Long> toolIds, LocalDateTime startDate, LocalDateTime endDate) {
        // 1. Fetch Entities & Validate Existence
        ClientEntity client = clientService.findByRut(clientRut);
        if (client == null) {
            throw new RuntimeException("Cliente no encontrado bajo el rut: " + clientRut);
        }

        List<ToolEntity> tools = toolRepository.findAllById(toolIds);
        if (tools.isEmpty() || tools.size() != toolIds.size()) {
            throw new RuntimeException("Algunas herramientas no fueron encontradas. Por favor verifica que esten correctamente ingresadas.");
        }

        // 2. Business Rules Validation
        if (endDate.isBefore(startDate)) {
            throw new RuntimeException("La fecha de termino del prestamo no puede ser anterior a la fecha de inicio del prestamo");
        }

        // Why: Just-in-Time Check. We re-calculate overdue status right now to ensure
        // the client didn't become blocked 5 seconds ago due to another rental expiring.
        boolean hasDebt = checkAndUpdateOverdueRentals(client);

        // Why: Gatekeeper. If the client is blocked (Status False), we abort immediately.
        if (hasDebt || Boolean.FALSE.equals(client.getClientStatus())) {
            throw new RuntimeException("El cliente tiene prestamos pendientes, no se le puede realiazar otro prestamo");
        }

        validateUniqueToolTypes(tools);

        // 3. Update State & Persist
        clientService.updateClient(client);

        RentalEntity rental = new RentalEntity();
        rental.setClient(client);
        rental.setRentalDate(startDate);
        rental.setReturnDate(endDate);
        rental.setRentalStatus(0); // 0 = Active

        // ENDPOINT SECURITY: Audit Trail.
        // We capture the current employee's username from the security context
        // to permanently record WHO authorized this transaction.
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = "system";

        if (auth != null && auth.isAuthenticated()) {
            Object principal = auth.getPrincipal();

            if (principal instanceof Jwt) {
                Jwt jwt = (Jwt) principal;
                username = jwt.getClaimAsString("preferred_username");
            } else {
                username = auth.getName();
            }
        }

        rental.setCreatedByUserId(username);
        rental.setAmountDue(0);

        RentalEntity savedRental = rentalRepo.save(rental);

        // 4. Side Effects: Lock Inventory & Log History
        for (ToolEntity tool : tools) {
            toolService.rentTool(savedRental, tool);
            // Log Type 4 = "Rented"
            kardexService.createKardex(4, tool, savedRental);
        }

        return savedRental;
    }

    public List<RentalEntity> getAll(){
        return rentalRepo.findAll();
    }

    // Why: Business Logic Rule. "One of each type".
    // Prevents a client from hoarding 5 drills of the same model, which is usually a sign of
    // commercial subletting or potential theft risk.
    private void validateUniqueToolTypes(List<ToolEntity> tools) {
        Set<Long> typeIds = new HashSet<>();
        for (ToolEntity tool : tools) {
            Long typeId = tool.getInformationTool().getIdInformationTool();
            if (typeIds.contains(typeId)) {
                throw new RuntimeException("No se puede rentar más de una herramienta de un mismo tipo ("
                        + tool.getInformationTool().getNameTool() + ")");
            }
            typeIds.add(typeId);
        }
    }

    public RentalEntity findById(Long id) {
        return rentalRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Prestamo no encontrado " + id));
    }

    /**
     * Checks active rentals for a client and updates them to Overdue (1) if time has passed.
     * Returns TRUE if any overdue rental exists (newly updated or previously existing).
     */
    @Transactional
    public boolean checkAndUpdateOverdueRentals(ClientEntity client) {
        // Reuse the logic by ID
        updateOverdueStatusById(client.getIdClient());

        // Check if any rental is in status 1 (Overdue)
        return rentalRepo.countByClient_IdClientAndRentalStatus(client.getIdClient(), 1) > 0;
    }

    /**
     * Internal helper to update statuses based on ID.
     * Separated so it can be called from getRentalsByClient.
     * ALSO UPDATES CLIENT STATUS if debts are detected.
     */
    @Transactional
    public void updateOverdueStatusById(Long clientId) {
        LocalDateTime now = LocalDateTime.now();
        // Find only active rentals (Status 0)
        List<RentalEntity> activeRentals = rentalRepo.findByClient_IdClientAndRentalStatus(clientId, 0);

        boolean statusChanged = false;
        ClientEntity clientRef = null;

        for (RentalEntity rental : activeRentals) {
            if (clientRef == null) {
                clientRef = rental.getClient();
            }

            // Why: Temporal Trigger. If the return date has passed (isBefore now),
            // we flip the status to 'Overdue' (1). This is a passive check that happens whenever data is read.
            if (rental.getReturnDate() != null && rental.getReturnDate().isBefore(now)) {
                rental.setRentalStatus(1);
                rentalRepo.save(rental);
                statusChanged = true;
            }
        }

        // Why: Cascading Effect. If a rental became overdue, the client is now a "Bad Client".
        // We trigger the client verification logic to immediately block them if necessary.
        if (statusChanged && clientRef != null) {
            clientService.verifiedState(clientRef);
        }
    }

    public int countActiveRentalsByClient(ClientEntity client) {
        return rentalRepo.countByClientAndRentalStatus(client, 0);
    }

    @Transactional
    public int countOverdueRentalsByClient(ClientEntity client) {
        checkAndUpdateOverdueRentals(client);
        return rentalRepo.countByClientAndRentalStatus(client, 1);
    }

    public List<RentalEntity> findAll() {
        return rentalRepo.findAll();
    }

    /**
     * Get rentals for a client.
     */
    @Transactional
    public List<RentalEntity> getRentalsByClient(long clientId, Integer status) {
        // 1. IMPORTANT: Update statuses first so the user sees real-time data
        // Why: The user might see "Active" on the screen, but physically it's already "Overdue" by 1 minute.
        // We refresh the logic before returning the list to guarantee accuracy.
        updateOverdueStatusById(clientId);

        // 2. Fetch data
        if (status != null) {
            return rentalRepo.findByClient_IdClientAndRentalStatus(clientId, status);
        }
        return rentalRepo.findAllByClient_IdClient(clientId);
    }

    /**
     * ENDPOINT TRANSACTION: Return Process.
     * Calculates final debt, updates tool condition, unlocks inventory, and closes the contract.
     */
    @Transactional
    public RentalEntity finalizeReturn(Long rentalId, Map<String, Object> request) {
        // 1. Validation
        RentalEntity rental = rentalRepo.findById(rentalId)
                .orElseThrow(() -> new RuntimeException("Prestamo no encontrado " + rentalId));

        if (rental.getRentalStatus() == 2) {
            throw new RuntimeException("El prestamo ya está resuelto");
        }

        // 2. Parse Payload (Extra Charges & Tool Conditions)
        int extraCharge = 0;
        if (request.containsKey("extraCharge") && request.get("extraCharge") != null) {
            extraCharge = ((Number) request.get("extraCharge")).intValue();
        }

        Map<String, Integer> toolStatuses = null;
        if (request.containsKey("toolStatuses") && request.get("toolStatuses") != null) {
            toolStatuses = (Map<String, Integer>) request.get("toolStatuses");
        }

        int totalDebt = 0;

        // 3. Fetch Inventory associated with this contract
        List<ToolEntity> toolsInRental = kardexService.getToolsByRental(rentalId);

        int a= 0;
        boolean amountAdd=true;

        // 4. Process each tool individually
        for (ToolEntity tool : toolsInRental) {
            // Why: Debt Calculation Flag. We only add the "Extra Charge" (e.g., late fee) ONCE per contract,
            // not multiplied by every tool. 'amountAdd' ensures it's added only on the first iteration.
            if(a!=0){
                amountAdd = false;
            }

            int newStatus = 0; // Default: Good Condition (0)

            // Override default status if the frontend reported damage
            String toolIdStr = String.valueOf(tool.getToolId());
            if (toolStatuses != null && toolStatuses.containsKey(toolIdStr)) {
                newStatus = ((Number) toolStatuses.get(toolIdStr)).intValue();
            }

            // Calculate debt for this specific item (Daily Rate * Days + Replacement Cost if broken)
            int toolDebt = toolService.debtForToolReturn(rental, tool, extraCharge, newStatus, amountAdd);
            totalDebt += toolDebt;

            // Unlock Inventory: Remove the rental link and set the new physical status
            tool.setRental(null);
            tool.setToolStatus(newStatus);
            toolRepository.save(tool);

            // 5. Audit Log (Kardex)
            int kardexType = 1; // Default: Standard Return

            // If broken/maintenance, we log specific events for tracking
            if (newStatus == 2) {
                kardexType = 3; // In Reparation
            } else if (newStatus == 3) {
                kardexType = 2; // Decommissioned
            }

            // Why: Double Logging?
            // If it's broken, we log "Returned" (1) AND "Broken" (2) to close the rental cycle cleanly
            // while also flagging the maintenance event.
            if(kardexType!=1){
                kardexService.createKardex(kardexType, tool, rental);
            }
            kardexService.createKardex(1, tool, rental);

            a++;
        }

        // 6. Update Financial Ledger
        ClientEntity client = rental.getClient();
        client.setAmountClient(client.getAmountClient() + totalDebt);
        // Why: Recalculate Client Status immediately. If the debt is high, they get blocked instantly.
        clientService.verifiedState(client);

        // 7. Close Contract
        rental.setRentalStatus(2); // 2 = Returned (Closed)
        rental.setAmountDue(totalDebt);

        return rentalRepo.save(rental);
    }
}