@workspace Create Unit Tests for the class #file:candidateService.ts:

- Use best practices when creating these tests.
- Cover as many edge cases as you can find.
- Give meaningful names to the tests that explain what they do
- Make sure to mock all dependencies

Do not write any code yet. First, let me know of any questions you might have.

---

Everything looks correct. Proceed to write tests.

---

The Candidate mock should be created with array fields initialized to empty arrays, instead of null.

---

Use spy on save methods instead of mocking the entire models.

---

Let's add tests for #file:validator.ts in the same manner as in #file:candidateService.test.ts. Give me the list of tests you plan on implementing.

---

The list seems correct, but take into account that only one method is being exported, so you will need to call validateCandidateData for all cases.