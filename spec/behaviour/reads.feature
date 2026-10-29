Feature: Public reads

  Scenario: Provider profile is returned with version and timestamp
    When the agent calls GET /provider
    Then the response status is 200
    And the response includes "version" and "last_updated"

  Scenario: Plan prices are integers in paise
    When the agent calls GET /plans
    Then every plan has "price_paise" as an integer
    And every plan has currency "INR"

  Scenario: Read rate limit is enforced
    Given an anonymous client has made 20 reads this minute
    When it calls GET /provider again
    Then the response status is 429
    And a Retry-After header is present

  Scenario: Public content matches the content files
    Given /content/provider.json has tutor_name "[Your full name]"
    When the agent calls GET /provider
    Then the returned tutor_name equals the value in /content/provider.json
