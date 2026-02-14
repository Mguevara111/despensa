let $data=document.getElementById('data');

const loaddata=()=>{
   if (localStorage.getItem('lasttrans')){
    let info=localStorage.getItem('lasttrans')
    //console.log('info',JSON.parse(info))
    let datashowed=JSON.parse(info);
    $data.innerHTML=`
        <p class="cp">Thanks ${datashowed.client.name.given_name} your transaction number <b>${datashowed.orderid}</b> with the items</p>
        
        <ul class="ullist">
            ${datashowed.units[0].items.map(el=>
                `<li>${el.name}</li>`
            ).join('')} 
        </ul>
        <p class="cp">For <b>${datashowed.units[0].amount.value}</b> </p>
        <p class="cp">has been successfully processed</p>
    `;

   }
   if (localStorage.getItem('lasttrans')){
    setTimeout(() => {
        localStorage.removeItem('lasttrans')
    }, 1000);        
    
    }
}

document.addEventListener('DOMContentLoaded',loaddata)

// document.addEventListener('click',(e)=>{
//     if(e.target.matches('.gohome')){
//         //console.log('borra local')
        
//     }
// })