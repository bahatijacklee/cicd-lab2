import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/client/App';

const renderApp = (route = '/') => render(<MemoryRouter initialEntries={[route]}><App /></MemoryRouter>);

afterEach(() => {
  cleanup();
});

describe('documentation site', () => {
  it('renders the documentation home page and learning paths', () => {
    renderApp();
    expect(screen.getByRole('heading', { name: 'Ship with confidence.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute('href', '/docs/introduction');
    expect(screen.getByText('Build a strong foundation')).toBeInTheDocument();
  });

  it('renders the active page and collapsible sidebar sections', async () => {
    const user = userEvent.setup();
    renderApp('/docs/workflow-syntax');
    const active = screen.getByRole('link', { name: 'Workflow Syntax' });
    expect(active).toHaveAttribute('aria-current', 'page');
    const section = screen.getByRole('button', { name: /github actions fundamentals/i });
    await user.click(section);
    expect(screen.queryByRole('link', { name: 'Workflow Syntax' })).not.toBeInTheDocument();
    await user.click(section);
    expect(screen.getByRole('link', { name: 'Workflow Syntax' })).toBeInTheDocument();
  });

  it('opens mobile navigation and closes it from the backdrop', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(screen.getByRole('button', { name: 'Close navigation' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close navigation' }));
    expect(screen.queryByRole('button', { name: 'Close navigation' })).not.toBeInTheDocument();
  });

  it('searches content, supports keyboard close, and reports empty results', async () => {
    const user = userEvent.setup();
    renderApp();
    await user.click(screen.getByRole('button', { name: /search documentation/i }));
    const input = screen.getByRole('textbox', { name: 'Search docs' });
    await user.type(input, 'matrix');
    expect(screen.getByRole('button', { name: /matrix builds/i })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /search documentation/i }));
    await user.type(screen.getByRole('textbox', { name: 'Search docs' }), 'zzzz-no-page');
    expect(screen.getByText(/no documentation found/i)).toBeInTheDocument();
  });

  it('shows headings, TOC links, navigation, and supports copy buttons', async () => {
    const user = userEvent.setup();
    renderApp('/docs/your-first-workflow');
    expect(screen.getByRole('heading', { name: /the workflow file/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'The workflow file' })).toHaveAttribute('href', '#the-workflow-file');
    expect(screen.getByRole('link', { name: /next.*workflow syntax/i })).toBeInTheDocument();
    vi.spyOn(navigator.clipboard, 'writeText');
    await user.click(screen.getAllByRole('button', { name: 'Copy code' })[0]);
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled());
  });

  it('shows a useful missing-page state', () => {
    renderApp('/docs/not-a-real-page');
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to documentation/i })).toBeInTheDocument();
  });
});
