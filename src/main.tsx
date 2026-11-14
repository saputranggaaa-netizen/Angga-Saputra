import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class AppErrorBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(error:Error,info:React.ErrorInfo){console.error('Digiplus UI render failure',error,info.componentStack)}
 render(){if(this.state.failed)return <main style={{fontFamily:'system-ui,sans-serif',maxWidth:560,margin:'10vh auto',padding:24,color:'#182334'}}><h1>Dashboard sementara tidak dapat ditampilkan</h1><p>Terjadi kesalahan saat memuat tampilan. Data penjualan dan Google Sheets tidak berubah.</p><button onClick={()=>location.reload()} style={{padding:'12px 18px',background:'#175cd3',color:'white',border:0,borderRadius:8,cursor:'pointer'}}>Muat ulang dashboard</button><p style={{fontSize:13,opacity:.65}}>Jika masih bermasalah, hubungi Store Leader Admin.</p></main>;return this.props.children}
}

createRoot(document.getElementById('root')!).render(<AppErrorBoundary><App/></AppErrorBoundary>);
