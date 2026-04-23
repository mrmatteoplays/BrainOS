import { useState, useEffect, useRef } from 'react'
import { callClaude } from './claude.js'

const STORAGE_KEY = 'second_brain_nodes'
const API_KEY_STORAGE = 'second_brain_api_key'

const CATEGORIES = {
  Strategy: '#00FFB2', Technology: '#00C8FF', Business: '#FFB800',
  Science: '#FF6B6B', Philosophy: '#C084FC', Skills: '#4ADE80', Other: '#94A3B8',
}
const categoryList = Object.keys(CATEGORIES)

function loadNodes() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveNodes(nodes) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes)) } catch {}
}

export default function App() {
  const [nodes, setNodes] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeNode, setActiveNode] = useState(null)
  const [view, setView] = useState('ask')
  const [totalXP, setTotalXP] = useState(0)
  const [justAdded, setJustAdded] = useState(null)
  const [error, setError] = useState(null)
  const [apiKey, setApiKey] = useState('')
  const [showKeyInput, setShowKeyInput] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    const stored = loadNodes()
    setNodes(stored)
    setTotalXP(stored.reduce((a, n) => a + (n.growth_score || 5), 0))
    const savedKey = localStorage.getItem(API_KEY_STORAGE) || ''
    setApiKey(savedKey)
    if (!savedKey) setShowKeyInput(true)
  }, [])

  const saveApiKey = (key) => {
    setApiKey(key)
    localStorage.setItem(API_KEY_STORAGE, key)
    setShowKeyInput(false)
  }

  const handleAsk = async () => {
    if (!question.trim() || loading) return
    if (!apiKey) { setShowKeyInput(true); return }
    setLoading(true)
    setError(null)
    try {
      const result = await callClaude(question, nodes, apiKey)
      const newNode = { id: Date.now(), question, ...result, timestamp: new Date().toISOString() }
      const updated = [newNode, ...nodes]
      setNodes(updated)
      saveNodes(updated)
      setTotalXP(prev => prev + (result.growth_score || 5))
      setJustAdded(newNode)
      setQuestion('')
      setTimeout(() => setJustAdded(null), 9000)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  const categoryCounts = categoryList.reduce((acc, cat) => {
    acc[cat] = nodes.filter(n => n.category === cat).length
    return acc
  }, {})
  const level = Math.floor(totalXP / 50) + 1
  const xpToNext = 50 - (totalXP % 50)

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', color: '#E2E8F0', fontFamily: "'DM Mono','Courier New',monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#0D1320;}
        ::-webkit-scrollbar-thumb{background:#1E3A5F;border-radius:2px;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ncard:hover{transform:translateY(-2px);transition:all .2s;cursor:pointer;}
        .nbtn:hover{color:#00FFB2!important;}
        .abtn:hover:not(:disabled){background:#00FFB2!important;color:#080C14!important;}
        textarea:focus{outline:none;border-color:#00FFB2!important;}
        input:focus{outline:none;border-color:#00FFB2!important;}
      `}</style>

      <div style={{position:'fixed',inset:0,pointerEvents:'none',zIndex:0,backgroundImage:'linear-gradient(rgba(0,255,178,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,178,.03) 1px,transparent 1px)',backgroundSize:'40px 40px'}}/>

      {/* API Key Modal */}
      {showKeyInput && (
        <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(8,12,20,.95)',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
          <div style={{background:'#0D1320',border:'1px solid #1E2D45',borderRadius:16,padding:32,maxWidth:480,width:'100%'}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,marginBottom:8}}>Enter API Key</div>
            <p style={{color:'#64748B',fontSize:13,lineHeight:1.7,marginBottom:20}}>
              You need an Anthropic API key to use Second Brain OS. Get one free at{' '}
              <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{color:'#00FFB2'}}>console.anthropic.com</a>
              . Your key is stored only in your browser's localStorage — never sent anywhere except directly to Anthropic.
            </p>
            <ApiKeyForm onSave={saveApiKey} initialKey={apiKey} />
            {nodes.length > 0 && (
              <button onClick={() => setShowKeyInput(false)} style={{marginTop:12,background:'none',border:'none',color:'#475569',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
                cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header style={{position:'sticky',top:0,zIndex:100,borderBottom:'1px solid #1E2D45',background:'rgba(8,12,20,.95)',backdropFilter:'blur(12px)',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:'54px',gap:12}}>
        <div style={{display:'flex',alignItems:'center',gap:9,flexShrink:0}}>
          <div style={{width:26,height:26,background:'linear-gradient(135deg,#00FFB2,#00C8FF)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>⬡</div>
          <span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:800,letterSpacing:'-.02em',whiteSpace:'nowrap'}}>SECOND BRAIN <span style={{color:'#00FFB2'}}>OS</span></span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:9}}>
          <span style={{fontSize:11,color:'#64748B',letterSpacing:'.08em'}}>LVL <span style={{color:'#00FFB2',fontWeight:500}}>{level}</span></span>
          <div style={{width:56,height:4,background:'#1E2D45',borderRadius:2,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${((50-xpToNext)/50)*100}%`,background:'linear-gradient(90deg,#00FFB2,#00C8FF)',borderRadius:2,transition:'width .5s ease'}}/>
          </div>
          <span style={{fontSize:11,color:'#64748B',whiteSpace:'nowrap'}}>{nodes.length} <span style={{color:'#475569'}}>nodes</span></span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <nav style={{display:'flex',gap:2}}>
            {[['ask','ASK'],['graph','KNOWLEDGE'],['insights','INSIGHTS']].map(([v,label])=>(
              <button key={v} className="nbtn" onClick={()=>setView(v)} style={{background:'none',border:'none',cursor:'pointer',padding:'5px 10px',fontSize:11,letterSpacing:'.08em',fontFamily:'inherit',color:view===v?'#00FFB2':'#475569',borderBottom:view===v?'1px solid #00FFB2':'1px solid transparent',transition:'color .2s'}}>{label}</button>
            ))}
          </nav>
          <button onClick={()=>setShowKeyInput(true)} title="API Key Settings" style={{background:'none',border:'1px solid #1E2D45',borderRadius:6,color:'#475569',fontSize:11,padding:'4px 8px',cursor:'pointer',fontFamily:'inherit'}}>⚙</button>
        </div>
      </header>

      <main style={{maxWidth:800,margin:'0 auto',padding:'36px 24px',position:'relative',zIndex:1}}>

        {/* ASK */}
        {view==='ask'&&(
          <div style={{animation:'fadeIn .4s ease'}}>
            <div style={{textAlign:'center',marginBottom:36}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:'clamp(30px,6vw,54px)',fontWeight:800,lineHeight:1.05,letterSpacing:'-.03em',marginBottom:8}}>
                What do you want<br/>
                <span style={{background:'linear-gradient(90deg,#00FFB2,#00C8FF,#00FFB2)',backgroundSize:'200% auto',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',animation:'shimmer 3s linear infinite'}}>to understand?</span>
              </div>
              <p style={{color:'#475569',fontSize:13,letterSpacing:'.04em'}}>Every question compounds. Every answer builds your brain.</p>
            </div>

            <div style={{background:'#0D1320',border:'1px solid #1E2D45',borderRadius:12,padding:18,marginBottom:20}}>
              <textarea ref={textareaRef} value={question} onChange={e=>setQuestion(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter'&&(e.metaKey||e.ctrlKey))handleAsk()}}
                placeholder="Ask anything... How does UDP work? What is compound interest? What makes a great startup pitch?"
                style={{width:'100%',minHeight:96,background:'transparent',border:'1px solid #1E2D45',borderRadius:8,color:'#E2E8F0',fontFamily:'inherit',fontSize:14,padding:'12px 14px',resize:'vertical',lineHeight:1.6,transition:'border-color .2s'}}
              />
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
                <span style={{fontSize:11,color:'#334155'}}>⌘/Ctrl + Enter to submit</span>
                <button className="abtn" onClick={handleAsk} disabled={loading||!question.trim()} style={{background:loading?'#1E2D45':'#00FFB210',border:'1px solid '+(loading?'#334155':'#00FFB2'),color:loading?'#475569':'#00FFB2',padding:'9px 24px',borderRadius:8,fontFamily:'inherit',fontSize:12,letterSpacing:'.1em',cursor:loading?'not-allowed':'pointer',fontWeight:500,transition:'all .2s',display:'flex',alignItems:'center',gap:8}}>
                  {loading?(<><div style={{width:11,height:11,border:'2px solid #475569',borderTopColor:'#00FFB2',borderRadius:'50%',animation:'spin .8s linear infinite'}}/> PROCESSING...</>):'ABSORB →'}
                </button>
              </div>
            </div>

            {error&&(
              <div style={{background:'#1A0808',border:'1px solid #FF6B6B40',borderRadius:8,padding:'12px 14px',marginBottom:16,fontSize:12,color:'#FF9999',lineHeight:1.7,wordBreak:'break-word'}}>
                <strong>⚠ Error:</strong> {error}
              </div>
            )}

            {justAdded&&(
              <div style={{animation:'fadeIn .5s ease',background:'linear-gradient(135deg,#00FFB208,#00C8FF05)',border:'1px solid #00FFB230',borderRadius:12,padding:22,marginBottom:24}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                  <div>
                    <div style={{fontSize:10,color:'#00FFB2',letterSpacing:'.15em',marginBottom:4}}>✦ NODE ABSORBED</div>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:700}}>{justAdded.concept}</div>
                  </div>
                  <div style={{background:'#00FFB215',border:'1px solid #00FFB240',borderRadius:8,padding:'5px 12px',fontSize:13,color:'#00FFB2',fontWeight:500,flexShrink:0}}>+{justAdded.growth_score} XP</div>
                </div>
                <p style={{color:'#94A3B8',fontSize:14,lineHeight:1.7,marginBottom:12}}>{justAdded.answer}</p>
                <div style={{background:'#080C14',borderLeft:'2px solid #00FFB2',padding:'10px 14px',borderRadius:'0 6px 6px 0',fontSize:13,color:'#00FFB2'}}>⚡ {justAdded.insight}</div>
                {justAdded.connections?.length>0&&(
                  <div style={{marginTop:10,display:'flex',gap:6,flexWrap:'wrap'}}>
                    {justAdded.connections.map((c,i)=><span key={i} style={{fontSize:11,padding:'3px 9px',background:'#1E2D45',borderRadius:4,color:'#64748B'}}>↗ {c}</span>)}
                  </div>
                )}
              </div>
            )}

            {nodes.length>0&&(
              <div>
                <div style={{fontSize:11,color:'#334155',letterSpacing:'.1em',marginBottom:10}}>RECENT — {nodes.length} NODES</div>
                <div style={{display:'flex',flexDirection:'column',gap:5}}>
                  {nodes.slice(0,6).map(node=>(
                    <div key={node.id} className="ncard" onClick={()=>{setActiveNode(node);setView('graph')}} style={{background:'#0D1320',border:'1px solid #1E2D45',borderRadius:8,padding:'11px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div style={{display:'flex',alignItems:'center',gap:9}}>
                        <div style={{width:8,height:8,borderRadius:'50%',background:CATEGORIES[node.category]||'#94A3B8',flexShrink:0}}/>
                        <div>
                          <div style={{fontSize:13,fontWeight:500}}>{node.concept}</div>
                          <div style={{fontSize:11,color:'#475569',marginTop:1}}>{node.question.slice(0,64)}{node.question.length>64?'…':''}</div>
                        </div>
                      </div>
                      <div style={{fontSize:11,color:'#334155',flexShrink:0,marginLeft:10}}>+{node.growth_score} XP</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {nodes.length===0&&!loading&&!error&&(
              <div style={{textAlign:'center',padding:'56px 0',color:'#334155'}}>
                <div style={{fontSize:38,marginBottom:10,opacity:.25}}>⬡</div>
                <div style={{fontSize:13,letterSpacing:'.04em',lineHeight:1.8}}>Your knowledge graph is empty.<br/>Ask your first question to begin.</div>
              </div>
            )}
          </div>
        )}

        {/* GRAPH */}
        {view==='graph'&&(
          <div style={{animation:'fadeIn .4s ease'}}>
            <div style={{marginBottom:24}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,letterSpacing:'-.02em',marginBottom:4}}>Knowledge Graph</div>
              <div style={{color:'#475569',fontSize:13}}>{nodes.length} concepts · {totalXP} XP</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:8,marginBottom:24}}>
              {categoryList.filter(c=>categoryCounts[c]>0).map(cat=>(
                <div key={cat} style={{background:'#0D1320',border:`1px solid ${CATEGORIES[cat]}30`,borderRadius:8,padding:12}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,color:CATEGORIES[cat]}}>{categoryCounts[cat]}</div>
                  <div style={{fontSize:10,color:'#64748B',marginTop:2,letterSpacing:'.06em'}}>{cat.toUpperCase()}</div>
                  <div style={{marginTop:8,height:2,background:'#1E2D45',borderRadius:1,overflow:'hidden'}}>
                    <div style={{height:'100%',width:`${(categoryCounts[cat]/Math.max(nodes.length,1))*100}%`,background:CATEGORIES[cat],borderRadius:1}}/>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {nodes.map(node=>(
                <div key={node.id} className="ncard" onClick={()=>setActiveNode(activeNode?.id===node.id?null:node)} style={{background:activeNode?.id===node.id?'#0F1A2E':'#0D1320',border:`1px solid ${activeNode?.id===node.id?(CATEGORIES[node.category]+'60'):'#1E2D45'}`,borderRadius:8,padding:'12px 14px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div style={{display:'flex',alignItems:'center',gap:9}}>
                      <div style={{width:9,height:9,borderRadius:'50%',background:CATEGORIES[node.category]||'#94A3B8',flexShrink:0}}/>
                      <span style={{fontSize:13,fontWeight:500}}>{node.concept}</span>
                      <span style={{fontSize:10,padding:'2px 7px',background:(CATEGORIES[node.category]||'#94A3B8')+'18',color:CATEGORIES[node.category]||'#94A3B8',borderRadius:3}}>{node.category}</span>
                    </div>
                    <span style={{fontSize:11,color:'#334155'}}>+{node.growth_score} XP</span>
                  </div>
                  {activeNode?.id===node.id&&(
                    <div style={{marginTop:14,animation:'fadeIn .3s ease'}}>
                      <div style={{fontSize:11,color:'#475569',marginBottom:7}}>Q: {node.question}</div>
                      <p style={{fontSize:13,color:'#94A3B8',lineHeight:1.7,marginBottom:10}}>{node.answer}</p>
                      <div style={{background:'#080C14',borderLeft:`2px solid ${CATEGORIES[node.category]}`,padding:'9px 13px',borderRadius:'0 4px 4px 0',fontSize:12,color:CATEGORIES[node.category]}}>⚡ {node.insight}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {nodes.length===0&&<div style={{textAlign:'center',padding:'56px 0',color:'#334155',fontSize:13}}>No nodes yet. Go ask a question.</div>}
          </div>
        )}

        {/* INSIGHTS */}
        {view==='insights'&&(
          <div style={{animation:'fadeIn .4s ease'}}>
            <div style={{marginBottom:24}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:24,fontWeight:800,letterSpacing:'-.02em',marginBottom:4}}>Your Insights</div>
              <div style={{color:'#475569',fontSize:13}}>The wisdom compressed from every question.</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:24}}>
              {[['TOTAL XP',totalXP,'#00FFB2'],['BRAIN LEVEL',level,'#00C8FF'],['NODES',nodes.length,'#FFB800']].map(([label,val,color])=>(
                <div key={label} style={{background:'#0D1320',border:`1px solid ${color}30`,borderRadius:10,padding:'16px 12px',textAlign:'center'}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,color}}>{val}</div>
                  <div style={{fontSize:10,color:'#475569',letterSpacing:'.1em',marginTop:3}}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:'#334155',letterSpacing:'.1em',marginBottom:10}}>CORE INSIGHTS — REVIEW THESE DAILY</div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {nodes.map(node=>(
                <div key={node.id} style={{background:'#0D1320',borderLeft:`2px solid ${CATEGORIES[node.category]||'#94A3B8'}`,borderRadius:'0 8px 8px 0',padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:14}}>
                  <div>
                    <div style={{fontSize:10,color:'#475569',marginBottom:3,letterSpacing:'.08em'}}>{node.concept.toUpperCase()}</div>
                    <div style={{fontSize:13,color:'#CBD5E1',lineHeight:1.6}}>{node.insight}</div>
                  </div>
                  <span style={{flexShrink:0,fontSize:10,padding:'3px 8px',background:(CATEGORIES[node.category]||'#94A3B8')+'18',color:CATEGORIES[node.category]||'#94A3B8',borderRadius:4}}>{node.category}</span>
                </div>
              ))}
            </div>
            {nodes.length===0&&<div style={{textAlign:'center',padding:'56px 0',color:'#334155',fontSize:13}}>Ask questions to generate insights.</div>}
          </div>
        )}
      </main>
    </div>
  )
}

function ApiKeyForm({ onSave, initialKey }) {
  const [val, setVal] = useState(initialKey || '')
  return (
    <div>
      <input
        type="password"
        value={val}
        onChange={e => setVal(e.target.value)}
        placeholder="sk-ant-api03-..."
        style={{width:'100%',background:'#080C14',border:'1px solid #1E2D45',borderRadius:8,color:'#E2E8F0',fontFamily:"'DM Mono',monospace",fontSize:13,padding:'12px 14px',marginBottom:12,transition:'border-color .2s'}}
      />
      <button
        onClick={() => val.trim() && onSave(val.trim())}
        disabled={!val.trim()}
        style={{width:'100%',background:'#00FFB210',border:'1px solid #00FFB2',color:'#00FFB2',padding:'11px',borderRadius:8,fontFamily:"'DM Mono',monospace",fontSize:13,letterSpacing:'.08em',cursor:'pointer',fontWeight:500}}
      >
        SAVE KEY & START →
      </button>
    </div>
  )
}
