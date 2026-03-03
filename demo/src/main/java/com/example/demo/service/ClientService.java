package com.example.demo.service;

import com.example.demo.entity.ClientEntity;
import com.example.demo.repository.ClientRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ClientService {

    private final ClientRepository clientRepo;
    private final RentalService rentalService;

    // Why: Circular Dependency Resolution.
    // ClientService needs RentalService (to check for overdue rentals).
    // RentalService needs ClientService (to validate clients before renting).
    // The '@Lazy' annotation tells Spring to initialize the bean only when it is actually used,
    // breaking the initialization deadlock.
    @Autowired
    public ClientService(ClientRepository clientRepo, @Lazy RentalService rentalService) {
        this.clientRepo = clientRepo;
        this.rentalService = rentalService;
    }

    /**
     * ENDPOINT LOGIC: List Retrieval.
     * Why: Centralizes filtering logic. Instead of the Controller deciding which Repository method to call,
     * the Service decides based on whether the input is null or valid.
     */
    public List<ClientEntity> getClients(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return clientRepo.findAll();
        } else {
            return clientRepo.findByRutContainingIgnoreCaseOrClientNameContainingIgnoreCase(keyword, keyword);
        }
    }

    /**
     * ENDPOINT LOGIC: Single Entity Lookup.
     * Why: "Just-In-Time" Validation. Whenever a client is accessed individually (e.g., to view details),
     * we force a status re-verification. This ensures the operator always sees the real-time eligibility
     * status, even if the database state changed milliseconds ago.
     */
    public ClientEntity findByRut(String rut) {
        ClientEntity client = clientRepo.findByRut(rut).orElse(null);

        if(client != null){
            verifiedState(client);
        }
        return client;
    }

    /**
     * ENDPOINT LOGIC: Onboarding.
     * Why: Data Integrity. We enforce business constraints (Unique RUT) here before hitting the database.
     * We also initialize critical financial fields (Amount = 0) to prevent NullPointerExceptions in math operations later.
     */
    public ClientEntity createClient(ClientEntity client) {
        if (client.getRut() == null || client.getRut().isEmpty()) {
            throw new IllegalArgumentException("Se requiere ingresar un RUT para continuar");
        }

        if (clientRepo.findByRut(client.getRut()).isPresent()) {
            throw new IllegalArgumentException("Ya existe un cliente con este RUT");
        }

        if (client.getClientStatus() == null) {
            client.setClientStatus(true);
        }

        client.setAmountClient(0);
        return clientRepo.save(client);
    }
    /**
     * ENDPOINT LOGIC: Modification.
     * Why: Partial Update Pattern. We only copy specific allowed fields (Name, Phone, Mail)
     * from the input object to the database object. This prevents accidental overwriting of sensitive
     * system fields like 'ID', 'RUT', or 'Debt Amount'.
     */
    public ClientEntity updateClient(ClientEntity clientUpdates) {
        // 1. Find the original client by RUT
        Optional<ClientEntity> existingOptional = clientRepo.findByRut(clientUpdates.getRut());

        if (existingOptional.isPresent()) {
            ClientEntity dbClient = existingOptional.get();

            // 2. Update allowed fields only
            dbClient.setClientName(clientUpdates.getClientName());
            dbClient.setPhone(clientUpdates.getPhone());
            dbClient.setMail(clientUpdates.getMail());

            // Why: Changing contact info doesn't change status, but we re-verify just in case
            // an admin manually unblocked them while debts still exist.
            verifiedState(dbClient);

            // 3. Save changes
            return clientRepo.save(dbClient);
        } else {
            throw new IllegalArgumentException("Hubo un problema encontrando al cliente, verifique los datos y vuelva a intentarlo.");
        }
    }

    /**
     * BUSINESS RULE ENGINE: The "Brain" of Client Management.
     * Why: Centralizes all blocking logic. If a client violates ANY rule (Too many rentals, Debt, Lateness),
     * this method flips the 'clientStatus' switch to FALSE, preventing any future actions in the system.
     */
    public void verifiedState(ClientEntity client) {
        boolean shouldBlock = false;

        // Rule 1: Risk Management. Cap active rentals at 5 to limit potential loss.
        if (rentalService.countActiveRentalsByClient(client) >= 5) {
            shouldBlock = true;
        }

        // Rule 2: Zero Tolerance for Debt. Any outstanding amount triggers a block.
        if (client.getAmountClient() > 0) {
            shouldBlock = true;
        }

        // Rule 3: Reputation Check. If they hold expired items, they are blocked.
        if (rentalService.countOverdueRentalsByClient(client) > 0) {
            shouldBlock = true;
        }

        // LOGIC: Smart Update.
        // We flip the status based on the flags above.
        boolean newStatus = !shouldBlock;

        // Optimization: Dirty Checking. We only perform a database write (.save)
        // if the status actually changed. This reduces database I/O on read-heavy operations.
        if (client.getClientStatus() != newStatus) {
            client.setClientStatus(newStatus);
            clientRepo.save(client);
        }
    }

    /**
     * ENDPOINT LOGIC: Reporting.
     * Why: Although inefficient (O(N) loop), this provides a specific list of high-risk clients.
     * Ideally, this should be refactored to a single JPQL query in the repository for performance.
     */
    public List<ClientEntity> getClientsWithOverdueRentals() {
        List<ClientEntity> allClients = clientRepo.findAll();
        List<ClientEntity> overdueClients = new ArrayList<>();

        for (ClientEntity client : allClients) {
            if (rentalService.countOverdueRentalsByClient(client) > 0) {
                overdueClients.add(client);
            }
        }

        return overdueClients;
    }

    public List<ClientEntity> getCLientByStatus(Boolean status) {
        return clientRepo.findByClientStatus(status);
    }

    /**
     * ENDPOINT LOGIC: Financial Transaction.
     * Why: @Transactional ensures Atomicity. If the payment logic executes but the status update fails,
     * the entire transaction rolls back, ensuring money isn't "lost" in the system.
     */
    @Transactional
    public ClientEntity processPayment(String rut, Integer amount) {
        // 1. Fetch Context
        ClientEntity client = clientRepo.findByRut(rut)
                .orElseThrow(() -> new RuntimeException("No se a encontrado cliente bajo el RUT: " + rut + "Verifique si ingreso el RUT correctamente y vuelba a intentarlo"));

        // 2. Defensive Coding / Validation
        if (amount == null || amount <= 0) {
            throw new RuntimeException("El precio debe ser mayor a 0, ingrese datos validos y vuelva a intentarlo");
        }

        if (amount > client.getAmountClient()) {
            throw new RuntimeException("El valor valor de pago (" + amount +
                    ") no puede ser mayor al valor de la duda del cliente (" + client.getAmountClient() + ").");
        }

        // 3. Logic: Deduct Balance
        int newDebt = client.getAmountClient() - amount;
        client.setAmountClient(newDebt);

        // 4. Trigger Side Effect: Auto-Unblock
        // If this payment clears the debt (and no other rules are violated),
        // this call will automatically flip the status back to 'Active'.
        verifiedState(client);

        return clientRepo.save(client);
    }
}