package com.medistock.validation;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

@Component
public class PasswordValidator {

    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[^A-Za-z0-9\\s]");
    private static final Pattern WHITESPACE_PATTERN = Pattern.compile("\\s");

    public boolean isValid(String password) {
        if (password == null) {
            return false;
        }

        if (password.length() < MIN_LENGTH) {
            return false;
        }

        if (WHITESPACE_PATTERN.matcher(password).find()) {
            return false;
        }

        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            return false;
        }

        if (!LOWERCASE_PATTERN.matcher(password).find()) {
            return false;
        }

        if (!DIGIT_PATTERN.matcher(password).find()) {
            return false;
        }

        if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            return false;
        }

        return true;
    }

    public String getValidationMessage() {
        return "Password must be at least " + MIN_LENGTH + " characters long, " +
                "contain at least one uppercase letter, one lowercase letter, " +
                "one digit, one special character (@#$%^&+=!), and no whitespace.";
    }

    public boolean passwordsMatch(String password, String confirmPassword) {
        if (password == null || confirmPassword == null) {
            return false;
        }
        return password.equals(confirmPassword);
    }
}
