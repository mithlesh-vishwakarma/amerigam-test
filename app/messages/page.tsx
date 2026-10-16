import { AppShell } from '@/components/app-shell';
export default function Messages() { return <AppShell><h1 className="page-title">Messages</h1><section className="two-pane"><aside>{['Aarav · Editor','Riya · Designer','Neel · Filmmaker'].map(x=><button key={x}>{x}</button>)}</aside><div className="empty-state">Choose a conversation to start messaging.</div></section></AppShell>; }
