Feature: Trial slots and holds

  Scenario: Open slots are listed for a locality and window
    Given slot "S-5531" is open at 17:00 IST tomorrow in locality "DL-NOIDA-07"
    When the agent calls GET /slots with locality "DL-NOIDA-07" covering tomorrow
    Then the response status is 200
    And "S-5531" appears with status "open"

  Scenario: Held and booked slots are not listed as open
    Given slot "S-5531" is held
    When the agent calls GET /slots covering tomorrow
    Then "S-5531" does not appear in the results

  Scenario: Holding an open slot succeeds
    Given slot "S-5531" is open
    When the agent calls POST /slots/S-5531/hold
    Then the response status is 201
    And the hold expires 10 minutes later
    And slot "S-5531" status is "held"

  Scenario: A second hold on the same slot is refused
    Given slot "S-5531" is held by another request
    When the agent calls POST /slots/S-5531/hold
    Then the response status is 409
    And the error code is "slot_unavailable"

  Scenario: A hold expires after 10 minutes
    Given slot "S-5531" was held 11 minutes ago
    Then slot "S-5531" status is "open"
    And the hold status is "expired"

  Scenario: Repeated hold request with the same key returns the same hold
    Given a hold was created with key "K-1" for slot "S-5531"
    When the same request is sent with key "K-1"
    Then the response returns the original hold
    And no second hold is created
