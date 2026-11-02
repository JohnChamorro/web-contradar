import asyncio,json
from playwright.async_api import async_playwright
import sys
S=sys.argv[1] if len(sys.argv)>1 else './'
BODY=open(S+'respuesta.json').read()
async def ruta(route):
    u=route.request.url
    if '/avance' in u: await route.fulfill(status=200,content_type='application/json',body=json.dumps({'existe':False}))
    elif '/visit' in u or '/lead' in u: await route.fulfill(status=200,content_type='application/json',body='{"ok":true}')
    elif '/public/diagnostico/901234567' in u: await route.fulfill(status=200,content_type='application/json',body=BODY)
    else: await route.continue_()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for tema in ['light','dark']:
            c=await b.new_context(viewport={'width':1440,'height':900},device_scale_factor=2,color_scheme=tema)
            pg=await c.new_page(); await pg.route('**/api/v1/public/diagnostico/**',ruta)
            await pg.goto('http://localhost:3000/diagnostico?nit=901234567'); await pg.wait_for_timeout(6000)
            await pg.evaluate("[...document.querySelectorAll('body *')].filter(e=>/^v1\.0\.0/.test((e.textContent||'').trim())&&e.children.length<3).forEach(e=>e.style.display='none'); (()=>{const t=[...document.querySelectorAll('h1,h2,h3,p,div')].find(e=>e.textContent.trim().startsWith('Entra con tu correo')); let a=t; while(a&&a.parentElement&&getComputedStyle(a).borderTopWidth==='0px') a=a.parentElement; if(a) a.style.visibility='hidden'})(); window.scrollTo(0,0)"); await pg.wait_for_timeout(500)
            col=await pg.evaluate("(()=>{const h=[...document.querySelectorAll('*')].find(e=>e.textContent.trim()==='ESTO DICE EL SECOP DE'||e.textContent.trim()==='Esto dice el SECOP de'); const r=h.getBoundingClientRect(); const v=[...document.querySelectorAll('a,button')].find(e=>e.textContent.includes('Ver el análisis completo')); const rv=v.getBoundingClientRect(); const h1=document.querySelector('h1').getBoundingClientRect(); return [r.left,r.top+scrollY,rv.right,rv.bottom+scrollY,h1.right]})()")
            print('caja',col)
            await pg.screenshot(path=S+f'cord-{tema}.png',full_page=True)
            print(tema, await pg.evaluate("[document.documentElement.scrollHeight, document.documentElement.dataset.theme]"))
            if tema=='light': open(S+'cord.txt','w').write(await pg.evaluate("document.body.innerText"))
            await c.close()
        await b.close()
asyncio.run(main())
