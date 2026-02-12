let $data=document.getElementById('data');

const loaddata=()=>{
   if (localStorage.getItem('lasttrans')){
    let info=localStorage.getItem('lasttrans')
    //console.log('info',JSON.parse(info))
    let datashowed=JSON.parse(info);
    $data.innerHTML=`
        <p>Thanks ${datashowed.client.name.given_name} your transaction number ${datashowed.orderid} with the items</p>
        
        <ul class="ullist">
            ${datashowed.units[0].items.map(el=>
                `<li>${el.name}</li>`
            ).join('')} 
        </ul>
        <p>For ${datashowed.units[0].amount.value} </p>
        <p>has been successfully processed</p>
    `;

   }
}

document.addEventListener('DOMContentLoaded',loaddata)

document.addEventListener('click',(e)=>{
    if(e.target.matches('.gohome')){
        //console.log('borra local')
        if (localStorage.getItem('lasttrans')){
            localStorage.removeItem('lasttrans')
        }
    }
})