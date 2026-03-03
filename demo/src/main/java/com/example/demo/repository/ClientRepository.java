package com.example.demo.repository;

import com.example.demo.entity.ClientEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<ClientEntity,Long> {

    /**
     * filter function for search a list of client with a relative rut or name
     */
    List<ClientEntity> findByRutContainingIgnoreCaseOrClientNameContainingIgnoreCase(String rut, String clientName);

    Optional<ClientEntity> findByRut(String rut);

    List<ClientEntity> findByClientStatus(Boolean status);
}
