Feature: Enquiries

  Scenario: Enquiry is accepted without contact details in the request
    Given the locality "DL-NOIDA-07" is in the service area
    When the agent posts an enquiry for maths and science
    Then the response status is 201
    And the enquiry status is "new"

  Scenario: Enquiry outside the service area is refused
    When the agent posts an enquiry for locality "MH-PUNE-01"
    Then the response status is 422
    And the error code is "outside_service_area"

  Scenario: Enquiry message is limited to 500 characters
    When the agent posts an enquiry with a 600-character message
    Then the response status is 422
    And the error code is "validation_failed"
