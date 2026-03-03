package com.medtracker.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "pharmacist_profiles")
public class PharmacistProfile {

    public PharmacistProfile() {}

    public PharmacistProfile(Long id, String fullName, String phone, String address, String shopName, String shopAddress, String licenseNumber, String openingHours, User user) {
        this.id = id;
        this.fullName = fullName;
        this.phone = phone;
        this.address = address;
        this.shopName = shopName;
        this.shopAddress = shopAddress;
        this.licenseNumber = licenseNumber;
        this.openingHours = openingHours;
        this.user = user;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "phone")
    private String phone;

    @Column(name = "address")
    private String address;

    @Column(name = "shop_name")
    private String shopName;

    @Column(name = "shop_address")
    private String shopAddress;

    @Column(name = "license_number")
    private String licenseNumber;

    @Column(name = "opening_hours")
    private String openingHours;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }

    public String getShopAddress() { return shopAddress; }
    public void setShopAddress(String shopAddress) { this.shopAddress = shopAddress; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    @Override
    public String toString() {
        return "PharmacistProfile{" +
                "id=" + id +
                ", fullName='" + fullName + '\'' +
                ", shopName='" + shopName + '\'' +
                ", licenseNumber='" + licenseNumber + '\'' +
                '}';
    }
}
