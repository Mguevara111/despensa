let $menumovil=document.querySelector('.menu__m')
const meta = document.createElement("meta");
const metaog = document.createElement("meta");
const metatwitter = document.createElement("meta");

//- Usar variables de entorno con un plugin (vite-plugin-html-env), de modo que no dependas de escribir la URL fija en tu HTML

metaog.setAttribute("property", "og:image");
metaog.setAttribute("content", `${import.meta.env.VITE_BASE_URL}/images/logo.jpg`);
document.head.appendChild(metaog);


metatwitter.setAttribute("property", "twitter:image");
metatwitter.setAttribute("content", `${import.meta.env.VITE_BASE_URL}/images/logo.jpg`);
document.head.appendChild(metatwitter);


meta.setAttribute("property", "og:url");
meta.setAttribute("content", `${import.meta.env.VITE_BASE_URL}`);
document.head.appendChild(meta);

document.addEventListener('click',(e)=>{
    //console.log(e.target)
    if(e.target.matches('.header__menubtn') || e.target.matches('.header__menubtn > svg') || e.target.matches('.header__menubtn path')){
        $menumovil.classList.add('menu__m--show')
    }

    if(e.target.matches('.menu__m__closebtn') || e.target.matches('.menu__m__closebtn > svg') || e.target.matches('.menu__m__closebtn path')){
        $menumovil.classList.remove('menu__m--show')
    }

    if(e.target.matches('.header__link')){
        if($menumovil.classList.contains('menu__m--show')){
            $menumovil.classList.remove('menu__m--show')
        }
    }
})