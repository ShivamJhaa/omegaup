import { v4 as uuid } from 'uuid';
import {
  GroupOptions,
} from '../support/types';
import { contestPage } from '../support/pageObjects/contestPage';
import { loginPage } from '../support/pageObjects/loginPage';
import { addSubtractDaysToDate } from '../support/commands';


describe('Contest Test', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('Should create a contest and retrieve it', () => {
    const userLoginOptions = loginPage.registerMultileUsers(2);

    const groupOptions: GroupOptions = {
      groupTitle: 'ut_group_' + uuid(),
      groupDescription: 'group description',
    };

    cy.loginAdmin();
    contestPage.createGroup(groupOptions);
    contestPage.addIdentitiesGroup();
    cy.logout();

    const contestOptions = contestPage.generateContestOptions();

    const users = [userLoginOptions[0].username, userLoginOptions[1].username];
    contestPage.createContestAdmin(contestOptions, users);

    cy.login(userLoginOptions[0]);
    cy.enterContest(contestOptions);
    cy.createRunsInsideContest(contestOptions);
    cy.logout();

    contestPage.updateScoreboardForContest(contestOptions.contestAlias);

    cy.loginAdmin();
    cy.get('a[data-nav-contests]').click();
    cy.get('a[data-nav-contests-arena]').click();
    cy.get(`a[href="/arena/${contestOptions.contestAlias}/"]`).first().click();
    cy.get('a[href="#ranking"]').click();
    cy.get('[data-table-scoreboard-username]').first().should('contain', userLoginOptions[0].username);
    cy.get('[data-table-scoreboard-username]').last().should('contain', userLoginOptions[1].username);
    cy.logout();
  });

  it('Should create a contest and add a clarification.', () => {
    const contestOptions = contestPage.generateContestOptions();
    const userLoginOptions = loginPage.registerMultileUsers(1);

    contestPage.createContestAdmin(contestOptions, [userLoginOptions[0].username]);

    cy.login(userLoginOptions[0]);
    cy.enterContest(contestOptions);
    contestPage.createClarificationUser(contestOptions, 'Question 1');
    cy.logout();

    cy.loginAdmin();
    cy.get('a[data-nav-contests]').click();
    cy.get('a[data-nav-contests-arena]').click();
    cy.get(`a[href="/arena/${contestOptions.contestAlias}/"]`).first().click();
    cy.get('a[href="#clarifications"]').click();
    cy.get('[data-tab-clarifications]').should('be.visible')
    cy.get('[data-select-answer]').select('No');
    cy.get('[data-form-clarification-answer]').submit();
    cy.get('[data-form-clarification-resolved-answer]').should('contain', 'No');
    cy.logout();
  });

  it('Should create a contest and review ranking', () => {
    const contestOptions = contestPage.generateContestOptions();
    const userLoginOptions = loginPage.registerMultileUsers(4);

    const groupOptions: GroupOptions = {
      groupTitle: 'ut_group_' + uuid(),
      groupDescription: 'group description',
    };

    cy.loginAdmin();
    contestPage.createGroup(groupOptions);
    contestPage.addIdentitiesGroup();
    cy.logout();

    const users: Array<string> = [];
    userLoginOptions.forEach((loginDetails) => {
      users.push(loginDetails.username);
    });

    contestPage.createContestAdmin(contestOptions, users);

    cy.login(userLoginOptions[0]);
    cy.enterContest(contestOptions);
    cy.createRunsInsideContest(contestOptions);
    cy.logout();

    cy.login(userLoginOptions[2]);
    cy.enterContest(contestOptions);
    cy.createRunsInsideContest(contestOptions);
    cy.logout();

    contestPage.updateScoreboardForContest(contestOptions.contestAlias);

    cy.loginAdmin();
    cy.get('a[data-nav-contests]').click();
    cy.get('a[data-nav-contests-arena]').click();
    cy.get(`a[href="/arena/${contestOptions.contestAlias}/"]`).first().click();
    cy.get('a[href="#ranking"]').click();
    cy.get('[data-table-scoreboard]').should('be.visible');
    cy.get('[data-table-scoreboard-username]').should('have.length', 4);
    cy.get(`.${userLoginOptions[2].username} > td:nth-child(2)`).contains(1);
    cy.get(`.${userLoginOptions[0].username} > td:nth-child(2)`).contains(1);
    cy.get(`.${userLoginOptions[1].username} > td:nth-child(2)`).contains(3);
    cy.get(`.${userLoginOptions[3].username} > td:nth-child(2)`).contains(3);
    cy.logout();
  });

  it('Should create a contest and reviewing ranking contests when the scoreboard shows' +
    ' time has finished', () => {
      const contestOptions = contestPage.generateContestOptions();
      const userLoginOptions = loginPage.registerMultileUsers(2);
      const users = [userLoginOptions[0].username, userLoginOptions[1].username];

      contestPage.createContestAdmin(contestOptions, users);

      cy.login(userLoginOptions[0]);
      cy.enterContest(contestOptions);
      cy.createRunsInsideContest(contestOptions);
      cy.logout();

      contestPage.updateScoreboardForContest(contestOptions.contestAlias);

      cy.loginAdmin();
      cy.get('a[data-nav-contests]').click();
      cy.get('a[data-nav-contests-arena]').click();
      cy.get(`a[href="/arena/${contestOptions.contestAlias}/"]`).first().click();
      cy.get('a[href="#ranking"]').click();
      cy.get('[data-table-scoreboard]').should('be.visible');
      cy.get('[data-table-scoreboard-username]').should('have.length', 2);
      cy.get(`.${userLoginOptions[0].username} > td:nth-child(4)`).contains('+100.00');
      cy.get(`.${userLoginOptions[1].username} > td:nth-child(4)`).contains('-');
      cy.logout();
    });

    it('Should give a past contest as a virtual contest', () => {
      const contestOptions = contestPage.generateContestOptions();
      const userLoginOptions = loginPage.registerMultileUsers(1);
      const users = [userLoginOptions[0].username];

      const now = new Date();

      contestOptions.startDate = addSubtractDaysToDate(now, {days: -2});
      contestOptions.endDate = addSubtractDaysToDate(now, {days: -1});

      contestPage.createContestAdmin(contestOptions, users);
      cy.pause();
    });
});
