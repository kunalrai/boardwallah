Feature: Privacy of minors and parents

  Scenario: Agents never see parent contact details
    When any agent calls any endpoint with a booking
    Then no response contains a phone number or email except the provider's own contact

  Scenario: Student identity is limited to a display name
    When a booking is created with student display name "Riya Sharma"
    Then the request is refused with code "validation_failed"

  Scenario: Consent records are kept separately from bookings
    Given a booking "B-111111111111" with consent "C-aaaaaaaaaaaa"
    Then the booking response contains consent_id but no consent token or parent phone

  Scenario: Parent deletion request removes personal data
    Given a booking and consent exist for a parent phone
    When the parent requests deletion
    Then the parent phone, student display name, and enquiry messages are deleted within 30 days
    And anonymised booking counts are retained
