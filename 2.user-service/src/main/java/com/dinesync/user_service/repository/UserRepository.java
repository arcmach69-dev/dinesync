package com.dinesync.user_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.dinesync.user_service.entity.User;

@Repository
public interface UserRepository 
                        extends JpaRepository<User, Long>{

     // Find user by email (for login)
    Optional<User> findByEmail(String email);
}
