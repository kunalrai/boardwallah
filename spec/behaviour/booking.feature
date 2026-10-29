Feature: Trial booking

  Scenario: Booking succeeds with a valid hold and consent
    Given slot "S-5531" is held by hold "H-aaaaaaaaaaaa"
    And a valid consent token for purpose "trial_booking"
    When the agent calls POST /trial-bookings with the hold, token, student "Riya", subjects ["maths"], and locality "DL-NOIDA-07"
    Then the response status is 201
    And a booking is created with status "confirmed" and payment_status "not_required"
    And slot "S-5531" status is "booked"
    And the parent receives a WhatsApp confirmation
    And the response includes a booking_access_token
    And the response does not include the parent's phone number

  Scenario: Booking without consent is rejected
    Given slot "S-5531" is held by hold "H-aaaaaaaaaaaa"
    When the agent calls POST /trial-bookings without a consent token
    Then the response status is 403
    And the error code is "consent_required"

  Scenario: Booking with an expired hold is rejected
    Given hold "H-aaaaaaaaaaaa" expired 1 minute ago
    When the agent books with that hold
    Then the response status is 410
    And the error code is "hold_expired"

  Scenario: Repeated booking with the same idempotency key creates nothing new
    Given a booking was created with idempotency key "K-2"
    When the same request is sent again with key "K-2"
    Then the response status is 200
    And the response returns the original booking
    And no second booking exists

  Scenario: Same idempotency key with a different body is refused
    Given a booking was created with idempotency key "K-2"
    When a request with key "K-2" and a different student name is sent
    Then the response status is 409
    And the error code is "idempotency_conflict"

  Scenario: Locality outside the service area is refused
    Given the provider's service localities are "DL-NOIDA-07" and "DL-NOIDA-12"
    When the agent books in locality "MH-PUNE-01"
    Then the response status is 422
    And the error code is "outside_service_area"

  Scenario: Parent can view their booking with the access token
    Given a booking "B-111111111111" exists
    When the parent calls GET /bookings/B-111111111111 with the booking_access_token
    Then the response status is 200
    And the booking is returned

  Scenario: Booking cannot be read without the token
    Given a booking "B-111111111111" exists
    When a request calls GET /bookings/B-111111111111 without a token
    Then the response status is 401

  Scenario: Cancellation more than 4 hours before start succeeds
    Given booking "B-111111111111" starts in 6 hours
    When the parent cancels it
    Then the booking status is "cancelled"
    And slot status returns to "open"

  Scenario: Cancellation within 4 hours is refused
    Given booking "B-111111111111" starts in 2 hours
    When the parent cancels it
    Then the response status is 409
    And the error code is "booking_not_cancellable"
