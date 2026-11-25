Feature: Review Rating Validation

  Scenario: User submits a valid review
    Given the user provides a rating of 5
    When the review is validated
    Then the review should be accepted

  Scenario: User submits an invalid review
    Given the user provides a rating of 6
    When the review is validated
    Then the review should be rejected

  Scenario: User submits a review with a rating below the minimum
    Given the user provides a rating of 0
    When the review is validated
    Then the review should be rejected