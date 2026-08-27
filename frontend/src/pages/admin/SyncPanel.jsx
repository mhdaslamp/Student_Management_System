import { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import { RefreshCw, CheckCircle, AlertTriangle, Users, Database, UploadCloud, FileSpreadsheet, Info, Bot, Globe } from 'lucide-react';

export default function SyncPanel() {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const [pasteText, setPasteText] = useState('');
    const [pasting, setPasting] = useState(false);
    const [importTab, setImportTab] = useState('csv'); // 'csv' | 'paste'

    const handlePasteSubmit = async (e) => {
        e.preventDefault();
        if (!pasteText.trim()) return;

        setPasting(true);
        setMessage('');

        try {
            const res = await axios.post('/sync/paste', { text: pasteText });
            const sum = res.data.summary;
            setMessage(`✅ Imported Successfully! Added ${sum.studentsCreated} students, updated ${sum.studentsUpdated}. Created ${sum.batchesCreated} batches.`);
            setPasteText('');
            fetchStatus();
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Failed to process pasted text.');
        } finally {
            setPasting(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await axios.get('/sync/status');
            setStatus(res.data);
        } catch (error) {
            console.error('Error fetching sync status:', error);
            setMessage('Failed to load sync status.');
        } finally {
            setLoading(false);
        }
    };

    const handleConnectGoogle = async () => {
        try {
            const res = await axios.get('/sync/oauth/url');
            if (res.data.url) {
                window.open(res.data.url, '_blank');
            }
        } catch (error) {
            setMessage('Failed to get OAuth URL. Check backend env vars.');
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        setMessage('');
        try {
            const res = await axios.post('/sync/directory');
            const sum = res.data.summary;
            setMessage(`✅ Sync Complete! Added ${sum.studentsCreated} students, updated ${sum.studentsUpdated}. Created ${sum.batchesCreated} batches.`);
            fetchStatus();
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Sync failed.');
        } finally {
            setSyncing(false);
        }
    };

    const handleUploadCSV = async (e) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setMessage('');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post('/sync/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const sum = res.data.summary;
            setMessage(`✅ CSV Imported Successfully! Added ${sum.studentsCreated} students, updated ${sum.studentsUpdated}. Created ${sum.batchesCreated} batches.`);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchStatus();
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'CSV Import failed. Please check file format.');
        } finally {
            setUploading(false);
        }
    };

    const [browserSyncing, setBrowserSyncing] = useState(false);

    const handleAutomatedBrowserSync = async () => {
        setBrowserSyncing(true);
        setMessage('');

        try {
            const res = await axios.post('/sync/automate-browser', {}, { timeout: 360000 });
            setMessage(res.data.message || '✅ Google Contacts Sync completed successfully!');
            fetchStatus();
        } catch (error) {
            console.error(error);
            setMessage(error.response?.data?.message || 'Sync failed. Please check terminal logs.');
        } finally {
            setBrowserSyncing(false);
        }
    };

    if (loading) return <div className="p-8 font-medium">Loading status...</div>;

    return (
        <div className="max-w-4xl w-full mx-auto p-6 flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-semibold mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Directory Sync & Batch Auto-Creation</h1>
                <p className="text-gray-600 font-medium">Automate student enrolment and batch creation directly from Google Workspace or Google Contacts.</p>
            </div>

            {message && (
                <div className={`p-4 font-medium rounded-xl border ${message.startsWith('✅') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
                    {message}
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#d0d3d9] rounded-2xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Synced Students</p>
                        <p className="text-3xl font-bold">{status?.totalStudents || 0}</p>
                    </div>
                </div>
                
                <div className="bg-white border border-[#d0d3d9] rounded-2xl p-6 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <Database size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Managed Batches</p>
                        <p className="text-3xl font-bold">{status?.totalBatches || 0}</p>
                    </div>
                </div>
            </div>

            {/* Option 1: 🤖 Automated Browser Sync */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Bot size={26} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                            Automated Google Contacts Browser Sync
                        </h2>
                        <p className="text-sm text-gray-600 max-w-xl">
                            Automatically opens Google Contacts Directory in a browser, scrolls to load all students, extracts names & emails, and builds batches in SAMS automatically.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="button"
                        onClick={handleAutomatedBrowserSync}
                        disabled={browserSyncing || syncing || uploading}
                        className="h-12 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={browserSyncing ? 'animate-spin' : ''} />
                        {browserSyncing ? 'Scraping & Syncing...' : 'Launch Automated Sync'}
                    </button>

                    <a
                        href={`javascript:(async()=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;let hud=document.getElementById('sams-hud');if(!hud){hud=document.createElement('div');hud.id='sams-hud';hud.style='position:fixed;top:20px;right:20px;z-index:999999;background:#1e1e2f;color:#fff;padding:16px 22px;border-radius:14px;box-shadow:0 12px 30px rgba(0,0,0,0.4);font-family:sans-serif;font-size:14px;max-width:340px;line-height:1.4;border:1px solid #3b82f6;';document.body.appendChild(hud);}hud.innerHTML='<b>🤖 SAMS In-Tab Sync</b><br>Scrolling directory gently...';const sc=document.querySelector('[role=\"main\"]')||document.documentElement;let prev=0,streak=0;for(let i=0;i<100;i++){let d=rnd(350,650);if(sc)sc.scrollBy({top:d,behavior:'smooth'});window.scrollBy({top:d,behavior:'smooth'});await sleep(rnd(750,1300));if(i%7===0&&i>0){if(sc)sc.scrollBy({top:-120,behavior:'smooth'});window.scrollBy({top:-120,behavior:'smooth'});await sleep(rnd(1000,1800));}let txt=document.body.innerText||'';let m=txt.match(/[a-zA-Z0-9._%+-]+@gecskp\\.ac\\.in/gi)||[];hud.innerHTML=\`<b>🤖 SAMS In-Tab Sync</b><br>Found <b>\${m.length}</b> contacts... scrolling...\`;if(m.length>0&&m.length===prev){streak++;if(streak>=4)break;}else{streak=0;}prev=m.length;}hud.innerHTML='<b>🤖 SAMS In-Tab Sync</b><br>Sending data to SAMS backend...';let fullText=document.body.innerText||'';try{let res=await fetch('http://localhost:5000/api/sync/paste',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+localStorage.getItem('token')},body:JSON.stringify({text:fullText})});let data=await res.json();if(data.success){hud.style.background='#166534';hud.innerHTML=\`<b>✅ Sync Complete!</b><br>Added \${data.summary.studentsCreated} students, created \${data.summary.batchesCreated} batches!\`;}else{hud.style.background='#991b1b';hud.innerHTML=\`<b>❌ Sync Error:</b> \${data.message}\`;}}catch(e){hud.style.background='#854d0e';hud.innerHTML='<b>⚠️ Could not reach localhost backend.</b> Check if backend is running!';}setTimeout(()=>hud.remove(),7000);})();`}
                        onClick={(e) => {
                            if (!window.location.href.includes('contacts.google.com')) {
                                alert("💡 To use this: Drag this button to your Bookmarks Bar! Then open contacts.google.com/directory in your browser and click this bookmark.");
                            }
                        }}
                        className="h-12 px-6 rounded-full bg-white border border-blue-300 hover:border-blue-500 text-blue-700 font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 shrink-0 cursor-grab active:cursor-grabbing"
                        title="Drag to your browser bookmarks bar"
                    >
                        ⚡ Drag to Bookmarks (In-Tab Sync)
                    </a>
                </div>
            </div>

            {/* Option 2: Import Contacts (CSV or Paste) */}
            <div className="bg-white border border-[#d0d3d9] rounded-2xl p-6 shadow-sm flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <FileSpreadsheet className="text-blue-600" size={24} />
                            <h2 className="text-xl font-semibold text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
                                Import College Students & Auto-Create Batches
                            </h2>
                        </div>
                        <p className="text-sm text-gray-600">
                            Upload a Google Contacts file or paste the student list to automatically enroll all students.
                        </p>
                    </div>

                    <div className="flex bg-gray-100 p-1 rounded-xl self-start sm:self-center">
                        <button
                            type="button"
                            onClick={() => setImportTab('csv')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${importTab === 'csv' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'}`}
                        >
                            Upload File
                        </button>
                        <button
                            type="button"
                            onClick={() => setImportTab('paste')}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${importTab === 'paste' ? 'bg-white text-black shadow-sm' : 'text-gray-600 hover:text-black'}`}
                        >
                            Paste List / Text
                        </button>
                    </div>
                </div>

                {importTab === 'csv' ? (
                    <>
                        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex gap-3 items-start text-sm text-blue-900">
                            <Info size={20} className="shrink-0 text-blue-600 mt-0.5" />
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold">How to export your college directory in Google Contacts:</span>
                                <ol className="list-decimal list-inside text-blue-800 space-y-0.5">
                                    <li>In <a href="https://contacts.google.com" target="_blank" rel="noreferrer" className="underline font-medium hover:text-blue-950">contacts.google.com</a>, hover over any contact in the Directory and click its <b>checkbox</b>.</li>
                                    <li>At the top selection bar, click the dropdown arrow next to the checkbox &gt; click <b>"All"</b>.</li>
                                    <li>Click the <b>"Add to contacts"</b> icon (+ person icon) on the top bar.</li>
                                    <li>Now click <b>"Contacts"</b> in the left menu &gt; click <b>Export &gt; Google CSV</b>.</li>
                                    <li>Upload that CSV file below!</li>
                                </ol>
                            </div>
                        </div>

                        <form onSubmit={handleUploadCSV} className="flex flex-col gap-4">
                            <div className="border-2 border-dashed border-gray-300 hover:border-black rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-gray-50/50 transition-colors" onClick={() => fileInputRef.current?.click()}>
                                <UploadCloud size={36} className="text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">
                                    {file ? file.name : "Click or drag & drop Google Contacts CSV / Excel file here"}
                                </span>
                                <span className="text-xs text-gray-400">Supports .csv, .xlsx, .xls</span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    className="hidden"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!file || uploading}
                                    className="h-12 px-8 rounded-full bg-black text-white font-semibold text-sm hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <RefreshCw size={16} className={uploading ? 'animate-spin' : ''} />
                                    {uploading ? 'Processing & Creating Batches...' : 'Upload & Auto-Create Batches'}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <form onSubmit={handlePasteSubmit} className="flex flex-col gap-4">
                        <p className="text-sm text-gray-600">
                            Paste text containing student names and emails (e.g. copied from Google Contacts, email threads, or student registers):
                        </p>
                        <textarea
                            rows={8}
                            value={pasteText}
                            onChange={(e) => setPasteText(e.target.value)}
                            placeholder="ABHINAV MURALI pkd23it007@gecskp.ac.in&#10;Abhinav Nath lpkd24me071@gecskp.ac.in&#10;ABHINAV P G pkd24cs004@gecskp.ac.in..."
                            className="w-full border border-gray-300 rounded-xl p-4 text-sm font-mono outline-none focus:border-black resize-y"
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={!pasteText.trim() || pasting}
                                className="h-12 px-8 rounded-full bg-black text-white font-semibold text-sm hover:bg-neutral-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <RefreshCw size={16} className={pasting ? 'animate-spin' : ''} />
                                {pasting ? 'Processing...' : 'Parse & Auto-Create Batches'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Option 2: Live API Sync */}
            <div className="bg-white border border-[#d0d3d9] rounded-2xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold flex items-center gap-2" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Google Workspace Direct API Sync
                        {status?.isConnected ? (
                            <CheckCircle size={20} className="text-green-500" />
                        ) : (
                            <AlertTriangle size={20} className="text-amber-500" />
                        )}
                    </h2>
                </div>

                {!status?.isConnected ? (
                    <div className="flex flex-col gap-3 items-start">
                        <p className="text-sm text-gray-600">
                            Connect your Google Workspace administrator account to sync live via Google People API.
                        </p>
                        <button
                            onClick={handleConnectGoogle}
                            className="bg-blue-600 text-white px-6 h-11 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Connect Google Directory
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 items-start">
                        <p className="text-sm text-gray-600">
                            Connected via OAuth. *(Requires Directory Contact Sharing to be enabled in Workspace Admin Console).*
                        </p>
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="bg-neutral-900 text-white px-8 h-12 rounded-full font-semibold text-sm hover:bg-black transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                            {syncing ? 'Syncing...' : 'Sync via API Now'}
                        </button>
                    </div>
                )}
            </div>

            {/* Full Screen Loading Overlay */}
            {(syncing || uploading) && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 max-w-sm w-full mx-4 shadow-2xl">
                        <RefreshCw size={40} className="text-blue-600 animate-spin" />
                        <h3 className="text-xl font-semibold">Processing Directory Data...</h3>
                        <p className="text-gray-500 text-center text-sm">
                            Parsing student emails, grouping by year & branch, and creating Batch documents. Please do not close this page.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

