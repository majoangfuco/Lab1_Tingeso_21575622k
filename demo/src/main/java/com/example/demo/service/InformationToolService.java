package com.example.demo.service;

import com.example.demo.entity.InformationToolEntity;
import com.example.demo.repository.InformationToolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InformationToolService {

    @Autowired
    private InformationToolRepository infoRepo;

    /**
     * ENDPOINT LOGIC: Search Router.
     * Why: This method acts as a switch. If the user types in the search bar,
     * we delegate to the specific search query. If the bar is empty, we return the full catalog.
     */
    public List<InformationToolEntity> getInfoTools(String keyword) {
        if (keyword != null && !keyword.isEmpty()) {
            return infoRepo.findByNameToolContainingIgnoreCase(keyword);
        }
        return infoRepo.findAll();
    }

    /**
     * ENDPOINT ACTION: Catalog Entry Creation.
     */
    public InformationToolEntity createInfoTool(InformationToolEntity info) {
        // Why: Gatekeeping. We enforce business rules (like non-negative prices)
        // before the data ever touches the database to maintain data quality.
        validateToolData(info);

        // Why: JPA Safety. The .save() method acts as "Update" if an ID is present.
        // We explicitly force the ID to null to guarantee a NEW row is inserted,
        // preventing accidental overwrites of existing tools.
        info.setIdInformationTool(null);

        return infoRepo.save(info);
    }

    /**
     * ENDPOINT DATA: Safe Retrieval.
     * Why: Wraps the Optional handling logic here so the Controller receives
     * either a valid object or null, keeping the Controller code cleaner.
     */
    public InformationToolEntity getInfoToolById(Long id) {
        return infoRepo.findById(id).orElse(null);
    }

    /**
     * ENDPOINT ACTION: Data Modification.
     */
    public InformationToolEntity updateInfoTool(InformationToolEntity infoUpdates) {
        // 1. Validation
        // Why: We cannot update a record that doesn't identify itself.
        if (infoUpdates.getIdInformationTool() == null) {
                throw new RuntimeException("Se requiere el tipo de herramienta para actualizar correctamente.");
        }

        Optional<InformationToolEntity> existingOpt = infoRepo.findById(infoUpdates.getIdInformationTool());

        if (existingOpt.isEmpty()) {
            return null; // Controller will handle the 404 response
        }

        // 2. Business Rules Check
        validateToolData(infoUpdates);

        // 3. Mapping Strategy
        // Why: We fetch the DB entity and update fields manually rather than saving 'infoUpdates' directly.
        // This ensures we preserve any fields that might not be in the update payload (though in this case we update all).
        InformationToolEntity dbTool = existingOpt.get();
        dbTool.setNameTool(infoUpdates.getNameTool());
        dbTool.setCategoryTool(infoUpdates.getCategoryTool());
        dbTool.setRepositionPrice(infoUpdates.getRepositionPrice());
        dbTool.setRentPrice(infoUpdates.getRentPrice());
        dbTool.setDuePrice(infoUpdates.getDuePrice());

        return infoRepo.save(dbTool);
    }

    // Why: Centralized Validation Logic.
    // By extracting this to a private helper, we ensure consistency:
    // Creating a tool and Updating a tool must obey the exact same rules (Price >= 0).
    private void validateToolData(InformationToolEntity info) {
        if (info.getNameTool() == null || info.getNameTool().trim().isEmpty()) {
            throw new RuntimeException("Se requiere el nombre de la herramienta, por favor ingrese un nombre");
        }
        if (info.getRepositionPrice() != null && info.getRepositionPrice() < 0) {
            throw new RuntimeException("El valor de reposición no puede ser negativo, por favor ingrese un precio válido.");
        }
        if (info.getRentPrice() != null && info.getRentPrice() < 0) {
            throw new RuntimeException("El valor del prestamo no puede ser negativo, por favor ingrese un precio válido");
        }
        // Add more rules as needed
    }

    public List<InformationToolEntity> getAll() {
        return infoRepo.findAll();
    }
}