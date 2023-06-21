import { v4 as uuid } from 'uuid';
import { coursePage } from '../support/pageObjects/coursePage';
import { ProblemOptions, RunOptions } from '../support/types';
import { loginPage } from '../support/pageObjects/loginPage';
import { contestPage } from '../support/pageObjects/contestPage';

describe('Course Test', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('Should create a course and add students to it as participate make submits to problems', () => {
    const loginOptions = loginPage.registerMultipleUsers(2);
    const users = [loginOptions[0].username];
    const courseOptions = coursePage.generateCourseOptions();
    const assignmentAlias = 'ut_rank_hw_' + uuid();
    const problemOptions: ProblemOptions = {
      problemAlias: uuid().slice(0, 10),
      tag: 'Recursion',
      autoCompleteTextTag: 'recur',
      problemLevelIndex: 0,
    };
    const runOptions: RunOptions = {
      problemAlias: problemOptions.problemAlias,
      fixturePath: 'main.cpp',
      language: 'cpp11-gcc',
      valid: true,
      status: 'AC',
    };

    cy.login(loginOptions[1]);
    cy.createProblem(problemOptions);
    coursePage.createCourse(courseOptions);
    coursePage.addStudents(users);
    coursePage.addAssignmentWithProblem(assignmentAlias, problemOptions);
    cy.logout();

    cy.login(loginOptions[0]);
    coursePage.enterCourse(courseOptions.courseAlias, assignmentAlias);
    coursePage.createSubmission(problemOptions, runOptions);
    coursePage.closePopup(problemOptions);
    cy.get('a[href="#ranking"]').click();
    cy.get('[data-table-scoreboard]').should('be.visible');
    cy.get('[data-table-scoreboard-username]').should('have.length', 1);
    cy.get(`.${loginOptions[0].username} > td:nth-child(4)`).should(
      'contain',
      '+100.00',
    );
    coursePage.createClarification(problemOptions.problemAlias, 'This is question');
    cy.pause();
    cy.logout();

    cy.login(loginOptions[1]);
    coursePage.enterCourseAssignmentPage(courseOptions.courseAlias);
    cy.get('[data-course-scoreboard-button]').click();
    cy.get(`.${loginOptions[0].username} > td:nth-child(4)`).should(
      'contain',
      '+100.00',
    );
    coursePage.enterCourseAssignmentPage(courseOptions.courseAlias);
    coursePage.answerClarification('No');
    coursePage.enterCourseAssignmentPage(courseOptions.courseAlias);
    coursePage.leaveFeedbackOnSolution('Solution is not optimal');
    coursePage.enterCourseAssignmentPage(courseOptions.courseAlias);
    coursePage.editCourse(courseOptions);
  });
});
