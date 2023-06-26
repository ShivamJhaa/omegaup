import { v4 as uuid } from 'uuid';
import { loginPage } from '../support/pageObjects/loginPage';
import { GroupOptions } from '../support/types';
import { contestPage } from '../support/pageObjects/contestPage';

describe('Group Test', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/');
  });

  it('Should create a group with identities', () => {
    const loginOptions = loginPage.registerMultipleUsers(2);
    const groupOptions: GroupOptions = {
      groupTitle: 'ut_group_' + uuid(),
      groupDescription: 'group description',
    };

    cy.login(loginOptions[0]);
    contestPage.createGroup(groupOptions);
    contestPage.addIdentitiesGroup();
    cy.logout();
  });
});
