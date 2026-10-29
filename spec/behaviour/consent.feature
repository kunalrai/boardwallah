Feature: Parent consent for trial booking

  Scenario: Consent request is sent to the parent's WhatsApp
    Given the parent phone is "+919800000001"
    When the agent calls POST /consent/requests with purpose "trial_booking"
    Then the response status is 202
    And the channel is "whatsapp"
    And the OTP is not included in the response

  Scenario: Consent request falls back to SMS when WhatsApp fails
    Given WhatsApp delivery fails for the parent phone
    When the agent calls POST /consent/requests
    Then the response status is 202
    And the channel is "sms"

  Scenario: Correct OTP grants a single-use consent token
    Given consent request "R-0a1b2c3d4e5f" is pending
    When the agent calls POST /consent/requests/R-0a1b2c3d4e5f/verify with the correct OTP
    Then the response status is 200
    And a consent token is returned with a 30-minute expiry
    When the same token is used for a second booking
    Then the error code is "consent_invalid"

  Scenario: Wrong OTP is rejected
    Given consent request "R-0a1b2c3d4e5f" is pending
    When the agent verifies with a wrong OTP
    Then the response status is 401
    And the error code is "unauthorized"

  Scenario: Five wrong OTP attempts lock the request
    Given consent request "R-0a1b2c3d4e5f" is pending
    When five wrong OTPs are submitted
    Then the next verify attempt returns 429
    And the request cannot be verified again

  Scenario: Expired OTP cannot be used
    Given consent request "R-0a1b2c3d4e5f" was created 11 minutes ago
    When the correct OTP is submitted
    Then the response status is 410
    And the error code is "consent_expired"
