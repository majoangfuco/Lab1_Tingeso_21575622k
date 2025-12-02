package com.example.demo.Repository;

import com.example.demo.Entity.InformationToolEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InformationToolRepository extends JpaRepository<InformationToolEntity ,Long> {

    List<InformationToolEntity> findByNameToolContainingIgnoreCase(String name);
}
