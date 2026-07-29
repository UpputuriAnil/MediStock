package com.medistock.constants;

public class SecurityConstants {

    public static final String JWT_HEADER = "Authorization";
    public static final String JWT_PREFIX = "Bearer ";
    public static final String SIGNING_KEY = "medistock-secret-key";
    public static final long ACCESS_TOKEN_EXPIRATION = 15 * 60 * 1000; // 15 minutes
    public static final long REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days

    public static final String ROLE_PREFIX = "ROLE_";
    
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_PHARMACIST = "ROLE_PHARMACIST";
    public static final String ROLE_STAFF = "ROLE_STAFF";

    // Permissions
    public static final String USER_CREATE = "USER_CREATE";
    public static final String USER_READ = "USER_READ";
    public static final String USER_UPDATE = "USER_UPDATE";
    public static final String USER_DELETE = "USER_DELETE";

    public static final String ROLE_CREATE = "ROLE_CREATE";
    public static final String ROLE_READ = "ROLE_READ";
    public static final String ROLE_UPDATE = "ROLE_UPDATE";
    public static final String ROLE_DELETE = "ROLE_DELETE";

    public static final String MEDICINE_CREATE = "MEDICINE_CREATE";
    public static final String MEDICINE_READ = "MEDICINE_READ";
    public static final String MEDICINE_UPDATE = "MEDICINE_UPDATE";
    public static final String MEDICINE_DELETE = "MEDICINE_DELETE";

    public static final String SUPPLIER_CREATE = "SUPPLIER_CREATE";
    public static final String SUPPLIER_READ = "SUPPLIER_READ";
    public static final String SUPPLIER_UPDATE = "SUPPLIER_UPDATE";
    public static final String SUPPLIER_DELETE = "SUPPLIER_DELETE";

    public static final String INVENTORY_CREATE = "INVENTORY_CREATE";
    public static final String INVENTORY_READ = "INVENTORY_READ";
    public static final String INVENTORY_UPDATE = "INVENTORY_UPDATE";
    public static final String INVENTORY_DELETE = "INVENTORY_DELETE";

    public static final String REPORT_READ = "REPORT_READ";
    public static final String DASHBOARD_READ = "DASHBOARD_READ";
    public static final String NOTIFICATION_SEND = "NOTIFICATION_SEND";

    private SecurityConstants() {
    }
}
