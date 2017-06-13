import { GitGuiPage } from './app.po';

describe('git-gui App', () => {
  let page: GitGuiPage;

  beforeEach(() => {
    page = new GitGuiPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
