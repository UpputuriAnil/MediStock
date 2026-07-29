package com.medistock.repository;

import com.medistock.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Optional<Supplier> findByIdAndDeletedFalse(Long id);

    List<Supplier> findByDeletedFalse();

    List<Supplier> findByActiveTrueAndDeletedFalse();

    Optional<Supplier> findByEmailAndDeletedFalse(String email);

    @Query("SELECT s FROM Supplier s WHERE s.deleted = false AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.contactPerson) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Supplier> searchSuppliers(String keyword);
}
