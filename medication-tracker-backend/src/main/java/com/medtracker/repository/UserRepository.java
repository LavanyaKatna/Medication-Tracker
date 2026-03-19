package com.medtracker.repository;

import com.medtracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(String role);
   @Query("SELECT u.role, COUNT(u) FROM User u GROUP BY u.role")
List<Object[]> getUserGrowth();
}
