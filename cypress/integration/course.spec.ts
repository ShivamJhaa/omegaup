import { v4 as uuid } from 'uuid';
import { coursePage } from '../support/pageObjects/coursePage';
import { ProblemOptions } from '../support/types';
import { loginPage } from '../support/pageObjects/loginPage';

describe('Course Test', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('Should create a course and add students to it as participate make submits to problems', () => {
    const loginOptions = loginPage.registerMultipleUsers(1);
    const users = [loginOptions[0].username];
    const courseOptions = coursePage.generateCourseOptions();
    const problemOptions: ProblemOptions = {
      problemAlias: uuid().slice(0, 10),
      tag: 'Recursion',
      autoCompleteTextTag: 'recur',
      problemLevelIndex: 0,
    };

    cy.loginAdmin();
    cy.createProblem(problemOptions);
    cy.createCourse(courseOptions);
    coursePage.addStudents(users);
    coursePage.addAssignmentWithProblem(courseOptions, problemOptions);
    cy.pause();
    cy.logout();
  });
});
