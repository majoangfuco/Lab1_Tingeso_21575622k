package com.example.demo.Repository;

import com.example.demo.Entity.ClientEntity;
import com.example.demo.Entity.RentalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<RentalEntity,Long> {
    public int countByClientAndRentalStatus(ClientEntity client, Integer rentalStatus);

    public List<RentalEntity> findAllByAmountDueNot(int amountDue);

    public List<RentalEntity> findByClient_IdClientAndRentalStatus(Long idClient, Integer rentalStatus);

    List<RentalEntity> findAllByClient_IdClient(Long idClient);

    int countByClient_IdClientAndRentalStatus(Long idClient, int status);
}
