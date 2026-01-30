import { base } from "./base.js";
import { initPayPalButton } from "./paypal.js";

let $productcontainer=document.querySelector('.products');
let $modalprods=document.querySelector('.modalpay');
let $modalname=document.querySelector('.modalpay__h2');
let $modalimage=document.querySelector('.modalpay__img');
let $modalquantity=document.querySelector('.modalpay__inumber');
let $modaltotal=document.querySelector('.modalpay__total');
let $messageinfo=document.querySelector('.message');
let $shoppingcart=document.querySelector('.shoppingcart');
let $scdata=document.querySelector('.shoppingcart__data');  //donde se llena la info del carrito
let $paybtn=document.getElementById('pay');
let modalquantity=1;  //cantidad producto en modal
let shoppingcart=[];  
let actualprod={};    //producto actual seleccionado al dar clic en buy
let total=0;  
let taxpercent=0.15;  //porcentaje de impuesto
let tax=0     //impuesto enviado a paypal
 let taxsub=0; // aqui va el total * porcentaje impuesto

const categorieslist=base.map(el=>{
  if(el.status === 'published'){
    return el.category;
  }
}).sort();
let newcat=new Set(categorieslist);
let categories=Array.from(newcat);
let fragmento=document.createDocumentFragment();

const showmessageinfo=(messa)=>{
  $messageinfo.textContent=messa.message;
  $messageinfo.style.backgroundColor=messa.color;
  $messageinfo.classList.add('message--show');
  setTimeout(()=>{
    $messageinfo.classList.remove('message--show');
  },3000)
}

const reviewshoppingcart=()=>{
  if(!localStorage.getItem('mgchart')){
    shoppingcart=[];    
    return;
  }

  shoppingcart=JSON.parse(localStorage.getItem('mgchart'))
  
}

const actualizalocalstorage=(data)=>{
  let datastring=JSON.stringify(data)
  if (data.length === 0){
    limpiacarrito();
    return;
  }
  if(!localStorage.getItem('mgchart')){
    //console.log('crea localstorage',datastring)
    localStorage.setItem('mgchart',datastring)
    return;
  }
  //console.log('actualiza localstorage',datastring)
  localStorage.removeItem('mgchart')
  localStorage.setItem('mgchart',datastring)
    
}

const actualizaprecio=(precio,cantidad)=>{
    $modaltotal.textContent=(parseFloat(precio)*parseInt(cantidad)).toFixed(2);
    //console.log()
}

const datosenmodal=(id)=>{
  
  const search=base.find(el=>el.id === id)
  if (search){
    $modalname.textContent=search.name;
    $modalimage.src=search.image
    $modalquantity.value=modalquantity;
    $modaltotal.textContent=search.price;
    
  }
}

const limpiamodal=()=>{
  $modalname.textContent='';
  $modalimage.src='';
  modalquantity=1;
  $modalquantity.value='';
  $modaltotal.textContent='';
}

const llenaproductos=()=>{
  for (let cat of categories){
    let $h2prod=document.createElement('h2');
      $h2prod.textContent=cat
  base.forEach(el=>{
              if(el.category === cat && el.status==='published'){
              let $figureprod=document.createElement('figure');
              $figureprod.classList.add('products__figure')
              $figureprod.innerHTML=`<figure>
                  <h3>${el.name}</h3>
                  <img class="products__img" src=${el.image} alt=${el.name}>
                  <figcaption>
                    <span><b>Price:</b></span><span>${el.price}</span>
                    </br>
                    <button class="products__seemore">see more</button>
                    <button data-id=${el.id} class="products__buy">Buy</button>
                  </figcaption>
                </figure>`;
                fragmento.appendChild($figureprod)
              }
  })
  $productcontainer.appendChild($h2prod)
  $productcontainer.appendChild(fragmento)
  }
  
}

const limpiacarrito=()=>{
  //borra local storage y shopping cart
  $scdata.innerHTML='';
  localStorage.removeItem('mgchart');
  $shoppingcart.classList.remove('shoppingcart--show');
  total=0;
  tax=0;
  taxsub=0;
}


document.addEventListener('DOMContentLoaded',()=>{
  llenaproductos();
})

const loadshoppingcart=()=>{
  let $title=document.querySelector('.shoppingcart__title')
 
  if(!localStorage.getItem('mgchart')){
    $title.textContent='Shopping cart is empty';
    return;
  }

  
  let loaddata=JSON.parse(localStorage.getItem('mgchart'));
  //console.log(loaddata)
  let sctotal=loaddata.reduce((acum,el)=>{
  
    let subto=(parseFloat(el.unit_amount.value) * parseInt(el.quantity));
    return acum+subto;
  },0)

  
  taxsub=parseFloat(sctotal) * taxpercent
  total=sctotal.toFixed(2); //pasamos el total a total para el envio a paypal
  tax=taxsub.toFixed(2);
  $title.textContent='Items';
  $scdata.innerHTML=`
    <table class="sctable">
                <thead>
                  <tr>
                    <th>ITEM</th>
                    <th>PRICE</th>
                    <th>QUANTITY</th>
                    <th>PARTIAL</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody class="sctbody">

                  ${loaddata.map(el=>
                    `
                    <tr>
                      <td>${el.name}</td>
                      <td>${el.unit_amount.value}</td>
                      <td>${el.quantity}</td>
                      <td>${(parseFloat(el.unit_amount.value) * parseInt(el.quantity)).toFixed(2)}</td>
                      <td><button  data-id=${el.id} data-name="${el.name}" class="scdeletebtno" >🗑️</button></td>
                    </tr>
                    `
                  ).join('')}
                </tbody>
              </table>

              <span><b>SUBTOTAL:</b></span>
              <span class="sctotal">$${sctotal.toFixed(2)}</span>
              <br>
              <span><b>TAX 15%:</b></span>
              <span class="sctotal">$${taxsub.toFixed(2)}</span>  
              <br>
              <span><b>TOTAL:</b></span>
              <span class="sctotal">$${(sctotal + taxsub).toFixed(2)}</span>
  
  `;
  
}

const completeadd=()=>{
  //al agregar producto completa el agregar data al carrito
  $modalprods.classList.remove('modalpay--show')
    let messagesend={
      message:`Product ${actualprod.name} added to shopping cart`,
      color:'green'
    }
    showmessageinfo(messagesend)
    limpiamodal();
}

document.addEventListener('click',(e)=>{
  
  if(e.target.matches('.products__buy')){
    //abre modal buy
   // console.log('modal')
    $modalprods.classList.add('modalpay--show')
    actualprod=base.find(el=>el.id === parseInt(e.target.dataset.id));
    datosenmodal(parseInt(e.target.dataset.id))
  }

  if(e.target.matches('.closemodal')){
    $modalprods.classList.remove('modalpay--show')
    limpiamodal();
  }

  /*********botones de input number del modal******/
  if(e.target.matches('.modalpay__p')){
    modalquantity++;
    $modalquantity.value=modalquantity;
    actualizaprecio(actualprod.price,modalquantity)
    
  }

  if(e.target.matches('.modalpay__m')){
      modalquantity--;
      if(modalquantity < 1){
        modalquantity=1;
        return;
      }
      $modalquantity.value=modalquantity;
      actualizaprecio(actualprod.price,modalquantity)
  }

  /********manda el producto al carrito y local storage*******/
  if(e.target.matches('.modalpay__addtocart')){

    let selecprod={
      id:actualprod.id,           //cambio gemini revisar*****************************
      name:actualprod.name,
      unit_amount:{
              currency_code: "USD",
              value: actualprod.price.toString()
            },
      quantity:$modalquantity.value
      //otra opcion no probada quantity:$modalquantity.value.toString()
    }
    
    reviewshoppingcart();
    //console.log('sc devuelto de reviews',shoppingcart)

    //******para evitar prods duplicados busca********************* */
    let searched=shoppingcart.find(el=>el.id === selecprod.id); //busca si producto ya existe en shopping antes de agregarlo
    if(!searched){
      shoppingcart=[...shoppingcart,selecprod];
       actualizalocalstorage(shoppingcart);
       completeadd();
       return;
    }
    const newshopping=shoppingcart.map(el=>{
      if(el.id === selecprod.id){
        return {
          ...el,
          quantity:parseInt(el.quantity) + parseInt(selecprod.quantity)
          //otra opcion no probada quantity: (parseInt(el.quantity) + parseInt(selecprod.quantity)).toString()
        }
      }else{
        return el;
      }
    })
    
    actualizalocalstorage(newshopping);
    completeadd();
    
  }

  if(e.target.matches('.header__gotoshopping-cart')){
    //abre modal de shopping cart
      $shoppingcart.classList.add('shoppingcart--show');
      loadshoppingcart();
  }

  if(e.target.matches('.shoppingcart__closebtn')){
    $shoppingcart.classList.remove('shoppingcart--show');
  }

  if(e.target.matches('.scdeletebtno')){
    let loadinfo=JSON.parse(localStorage.getItem('mgchart'));
    let searched=loadinfo.filter(el=>parseInt(e.target.dataset.id) !== el.id)
    actualizalocalstorage(searched);
    loadshoppingcart();
  }

  if (e.target.matches('#pay')){
    //console.log(total,tax)
    if(!localStorage.getItem('mgchart')){
      //console.log('The shopping cart is emprty!, add a product first')
      let messagesend={
      message:'The shopping cart is emprty!, add a product first',
      color:'orange'
    }
      showmessageinfo(messagesend);
      return;
    }
    
    let datashopping=JSON.parse(localStorage.getItem('mgchart'))
    document.getElementById('paypal-button-container').innerHTML='';
    initPayPalButton(datashopping,total,tax,'#paypal-button-container',limpiacarrito)
  }
})
