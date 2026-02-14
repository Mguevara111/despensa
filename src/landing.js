let $menumovil=document.querySelector('.menu__m')

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