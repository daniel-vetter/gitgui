import { GitGuiPage } from './app.po';

describe('git-gui App', () => {
  let page: GitGuiPage;

  beforeEach(() => {
    page = new GitGuiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
