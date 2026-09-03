const API = "/api";

let token = "";
async function register(){

    const name =
        document.getElementById("regName").value;

    const email =
        document.getElementById("regEmail").value;

    const password =
        document.getElementById("regPassword").value;

    const res = await fetch(API+"/register",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            name,
            email,
            password
        })

    });

    const data = await res.json();

    alert(data.message);

}async function login(){

    const email =
        document.getElementById("loginEmail").value;

    const password =
        document.getElementById("loginPassword").value;

    const res = await fetch(API+"/login",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            email,
            password
        })

    });

    const data = await res.json();

    token = data.token;

    if(token){

        document
            .getElementById("dashboard")
            .style.display="block";

        loadBalance();

        loadTransactions();

    }else{

        alert(data.message);

    }

}
async function loadBalance(){

    const res = await fetch(API+"/balance",{

        headers:{
            Authorization:"Bearer "+token
        }

    });

    const data = await res.json();

    document
        .getElementById("balance")
        .innerHTML=
        "Balance: $"+data.balance;

}
async function transfer(){

    const receiverEmail =
        document.getElementById("receiverEmail").value;

    const amount =
        document.getElementById("amount").value;

    const res = await fetch(API+"/transfer",{

        method:"POST",

        headers:{

            "Content-Type":"application/json",

            Authorization:"Bearer "+token

        },

        body:JSON.stringify({

            receiverEmail,

            amount

        })

    });

    const data = await res.json();

    alert(data.message);

    loadBalance();

    loadTransactions();

}
async function transfer(){

    const receiverEmail =
        document.getElementById("receiverEmail").value;

    const amount =
        document.getElementById("amount").value;

    const res = await fetch(API+"/transfer",{

        method:"POST",

        headers:{

            "Content-Type":"application/json",

            Authorization:"Bearer "+token

        },

        body:JSON.stringify({

            receiverEmail,

            amount

        })

    });

    const data = await res.json();

    alert(data.message);

    loadBalance();

    loadTransactions();

}
async function loadTransactions(){

    const res = await fetch(API+"/transactions",{

        headers:{
            Authorization:"Bearer "+token
        }

    });

    const data = await res.json();

    const list =
        document.getElementById("transactions");

    list.innerHTML="";

    data.forEach(t=>{

        list.innerHTML +=

        `<li>

        ${t.sender}

        →

        ${t.receiver}

        :

        $${t.amount}

        </li>`;

    });

}
