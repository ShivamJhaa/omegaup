import { v4 as uuid } from 'uuid';
import { addSubtractDaysToDate } from '../commands';
import { CourseOptions, ProblemOptions } from '../types';

export class CoursePage {
  generateCourseOptions(): CourseOptions {
    const now = new Date();
    const courseOptions: CourseOptions = {
      courseAlias: uuid().slice(0, 10),
      showScoreboard: true,
      startDate:  addSubtractDaysToDate(now, { days: -1 }),
      endDate: addSubtractDaysToDate(now, { days: 1 }),
      unlimitedDuration: false,
      school: 'Escuela curso',
      basicInformation: false,
      requestParticipantInformation: 'optional',
      problemLevel: 'intermediate',
      objective: 'This is the objective',
      description: 'This is the description',
    };

    return courseOptions;
  }

  addStudents(users: Array<string>): void {
    cy.get('[data-course-edit-students]').click();
    cy.get('textarea[data-course-multiple-students-add]').type(
      users.join(', '),
    );
    cy.get('.user-add-bulk').click();

    cy.get('[data-uploaded-students]').then((rawHTMLElements) => {
      const studentsNames: Array<string> = [];
      Cypress.$.makeArray(rawHTMLElements).forEach((element) => {
        cy.task('log', element.innerText);
        studentsNames.push(element.innerText);
      });

      cy.wrap(studentsNames).as('savedStudentsNames');
    });

    cy.get('@savedStudentsNames').should('deep.equal', users);
    cy.pause();
  }

  addAssignmentWithProblem(assignmentAlias: string, problemOptions: ProblemOptions): void {
    cy.get('[data-course-edit-content]').click();
    cy.get('div[data-content-tab]').should('be.visible');

    cy.get('button[data-course-add-new-content]').click();

    cy.get('.omegaup-course-assignmentdetails').should('be.visible');
    cy.get('[data-course-assignment-name]').type(assignmentAlias);
    cy.get('[data-course-assignment-alias]').type(assignmentAlias.slice(0, 10));
    cy.get('[data-course-add-problem]').should('be.visible');
    cy.get('[data-course-assignment-description]').type('Homework Description');
    cy.get('.tags-input input[type="text"]').type('Sumas');
    cy.get('.typeahead-dropdown li').first().click();
    cy.get('button[data-add-problem]').click();
    cy.get('[data-course-problemlist] table.table-striped').should('be.visible');
    cy.get('button[data-schedule-assignment]').click();
    cy.get('.alert-success').should('contain', 'Content added successfully!');
    cy.get('.omegaup-course-assignmentdetails').should('not.be.visible');
  }

  enterCourse(courseAlias: string, assignmentAlias: string, firstTime: boolean = false): void {
    cy.get('a[data-nav-courses]').click();
    cy.get('a[data-nav-courses-all]').click();

    const courseUrl = '/course/' + courseAlias;
    cy.visit(courseUrl);
    cy.pause();

    if (firstTime) {
      cy.get('button[name="start-course-submit"]').click();
    }

    const assignmentUrl = `/course/${courseAlias}/assignment/${assignmentAlias}/`;
    cy.visit(assignmentUrl);
    cy.url().should('include', '#problems');
    cy.get('sup.socket-status-ok').should('be.visible');
    cy.pause();

  }

  createCourse(courseOptions: CourseOptions): void {
    cy.loginAdmin();
    cy.createCourse(courseOptions);
  }
}

export const coursePage = new CoursePage();
