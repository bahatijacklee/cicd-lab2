import { marked } from 'marked';
import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { docs, getDoc, navigation, type DocPage } from './content';

type Heading = { id: string; text: string; level: number };

const slugify = (text: string) => text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');

function parseMarkdown(body: string) {
  const headings: Heading[] = [];
  const html = marked.parse(body, { async: false }) as string;
  const withAnchors = html.replace(/<h([2-3])>(.*?)<\/h\1>/g, (_match, level: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, '');
    const id = slugify(text);
    headings.push({ id, text, level: Number(level) });
    return `<h${level} id="${id}"><a class="heading-anchor" href="#${id}" aria-label="Link to ${text}">#</a>${inner}</h${level}>`;
  });
  return { html: withAnchors, headings };
}

function Header({ onSearch, onMenu }: { onSearch: () => void; onMenu: () => void }) {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <header className="topbar">
      <button className="icon-button mobile-only" aria-label="Open navigation" onClick={onMenu}>☰</button>
      <Link className="brand" to="/"><span className="brand-mark">CI</span><span>CI/CD Lab</span></Link>
      <nav className="top-links" aria-label="Primary navigation">
        <Link to="/">Documentation</Link>
        <Link to="/docs/your-first-workflow">Learning paths</Link>
        <Link to="/docs/create-first-workflow">Practical labs</Link>
        <a href={import.meta.env.VITE_GITHUB_URL ?? 'https://github.com/bahatijacklee/cicd-lab2'} target="_blank" rel="noreferrer">GitHub ↗</a>
      </nav>
      <div className="top-actions">
        <button className="search-trigger" onClick={onSearch} aria-label="Search documentation">⌕ <span>Search</span><kbd>⌘ K</kbd></button>
        <button className="icon-button" onClick={() => setDark((value) => !value)} aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`}>{dark ? '☀' : '◐'}</button>
      </div>
    </header>
  );
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const location = useLocation();
  const current = location.pathname.split('/').pop();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => Object.fromEntries(navigation.map((section) => [section.title, true])));
  return (
    <>
      {open && <button className="drawer-backdrop" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-heading">Learn CI/CD</div>
        <nav aria-label="Documentation navigation">
          {navigation.map((section) => (
            <div className="nav-section" key={section.title}>
              <button className="section-toggle" aria-expanded={expanded[section.title]} onClick={() => setExpanded((value) => ({ ...value, [section.title]: !value[section.title] }))}>
                <span>{section.title}</span><span aria-hidden="true">{expanded[section.title] ? '−' : '+'}</span>
              </button>
              {expanded[section.title] && <div className="nav-items">{section.items.map((slug) => {
                const doc = getDoc(slug)!;
                const active = current === slug;
                return <Link onClick={onClose} className={active ? 'active' : ''} aria-current={active ? 'page' : undefined} key={slug} to={`/docs/${slug}`}>{doc.title}</Link>;
              })}</div>}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return docs.filter((doc) => `${doc.title} ${doc.description} ${doc.body}`.toLowerCase().includes(normalized));
  }, [query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search documentation">
      <button className="search-dismiss" onClick={onClose} aria-label="Close search" />
      <div className="search-panel">
        <div className="search-input-wrap"><span aria-hidden="true">⌕</span><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search docs..." aria-label="Search docs" /></div>
        {query && !results.length && <p className="empty-state">No documentation found for “{query}”. Try a different term.</p>}
        {!query && <p className="empty-state">Search page titles, headings, and examples.</p>}
        <div className="search-results">{results.map((doc) => <button key={doc.slug} onClick={() => { navigate(`/docs/${doc.slug}`); onClose(); }}><strong>{doc.title}</strong><span>{doc.description}</span></button>)}</div>
      </div>
    </div>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return <button className="copy-button" onClick={() => { void navigator.clipboard.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1400); }); }} aria-label="Copy code">{copied ? 'Copied' : 'Copy'}</button>;
}

function Toc({ headings }: { headings: Heading[] }) {
  return <aside className="toc"><div className="toc-title">On this page</div>{headings.map((heading) => <a className={heading.level === 3 ? 'toc-nested' : ''} href={`#${heading.id}`} key={heading.id}>{heading.text}</a>)}</aside>;
}

function DocPageView({ doc }: { doc: DocPage }) {
  const parsed = useMemo(() => parseMarkdown(doc.body), [doc.body]);
  const index = docs.findIndex((item) => item.slug === doc.slug);
  const previous = docs[index - 1];
  const next = docs[index + 1];
  const codeBlocks = parsed.html.match(/<code[^>]*>([\s\S]*?)<\/code>/g) ?? [];
  return (
    <main className="content-layout">
      <article className="doc-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Docs</Link><span>/</span><span>{doc.title}</span></nav>
        <div className="eyebrow">{doc.level} guide</div>
        <h1>{doc.title}</h1>
        <p className="lead">{doc.description}</p>
        <div className="rule" />
        <div className="markdown" dangerouslySetInnerHTML={{ __html: parsed.html }} />
        {codeBlocks.length > 0 && <div className="copy-tools">{codeBlocks.map((block, blockIndex) => <CopyButton key={blockIndex} code={block.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>')} />)}</div>}
        <div className="page-nav"><span>{previous && <Link to={`/docs/${previous.slug}`} className="page-nav-card"><span>← Previous</span><strong>{previous.title}</strong></Link>}</span><span>{next && <Link to={`/docs/${next.slug}`} className="page-nav-card next"><span>Next →</span><strong>{next.title}</strong></Link>}</span></div>
      </article>
      <Toc headings={parsed.headings} />
    </main>
  );
}

function Home() {
  return <main className="home content-layout"><article className="doc-content home-content"><div className="eyebrow">A practical learning path</div><h1>Ship with confidence.</h1><p className="lead">Learn how continuous integration, delivery, and deployment turn small changes into reliable software releases.</p><div className="home-actions"><Link className="button primary" to="/docs/introduction">Get started →</Link><Link className="button secondary" to="/docs/your-first-workflow">Your first workflow</Link></div><div className="rule" /><h2>Learn by doing</h2><div className="topic-grid">{[['Beginner', 'Build a strong foundation', 'introduction'], ['Intermediate', 'Design dependable pipelines', 'build-test-release'], ['Advanced', 'Secure and scale workflows', 'workflow-security']].map(([level, text, slug]) => <Link className="topic-card" to={`/docs/${slug}`} key={level}><span>{level}</span><strong>{text}</strong><em>Explore path →</em></Link>)}</div><div className="featured"><div><span className="eyebrow">Featured tutorial</span><h2>Your first Node.js testing workflow</h2><p>Use one repeatable command to verify TypeScript, tests, and a production build on every pull request.</p><Link to="/docs/your-first-workflow">Read the tutorial →</Link></div><pre><code>{`name: Verify
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - run: npm ci
      - run: npm run verify`}</code></pre></div><div className="lab-callout"><div><span className="eyebrow">Hands-on labs</span><h2>Turn concepts into muscle memory.</h2></div><Link className="button secondary" to="/docs/create-first-workflow">Browse labs →</Link></div></article></main>;
}

function Missing() {
  return <main className="content-layout"><article className="doc-content"><div className="eyebrow">404</div><h1>Page not found</h1><p className="lead">That documentation page does not exist. Return to the guide index to continue learning.</p><Link className="button primary" to="/">Back to documentation</Link></article></main>;
}

function DocRoute() {
  const { slug } = useParams();
  const doc = slug ? getDoc(slug) : undefined;
  return doc ? <DocPageView doc={doc} /> : <Missing />;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return <><Header onSearch={() => setSearchOpen(true)} onMenu={() => setSidebarOpen(true)} /><div className="site-shell"><Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} /><Routes><Route path="/" element={<Home />} /><Route path="/docs/:slug" element={<DocRoute />} /><Route path="*" element={<Missing />} /></Routes></div>{searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}</>;
}
