
const KSA_CITIES = ["الرياض","جدة","الدمام","المدينة المنورة"];
const SD_STATES = ["ولاية الخرطوم","الولاية الشمالية","الجزيرة","كسلا","القضارف","سنار","النيل الأبيض","النيل الأزرق","البحر الأحمر","شمال كردفان","جنوب كردفان","غرب كردفان","شمال دارفور","جنوب دارفور","شرق دارفور","وسط دارفور","غرب دارفور"];

function fillSelect(id, list) {
  const el = document.getElementById(id);
  el.innerHTML = '<option value="">اختر...</option>' + list.map(x=>`<option>${x}</option>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  fillSelect("cityKSA", KSA_CITIES);
  fillSelect("stateSD", SD_STATES);

  document.getElementById("nextToTypes").addEventListener("click", () => {
    const required = ["cityKSA","stateSD","citySD","phone","countryCode","address"];
    let ok = true;
    required.forEach(id => {
      const el = document.getElementById(id);
      if(!el.value.trim()){
        el.classList.add("error"); ok = false;
      }else el.classList.remove("error");
    });
    if(!ok){ alert("يرجى تعبئة الحقول الإلزامية (المعلّمة بنجمة *)"); return; }

    document.getElementById("step1").style.display = "none";
    document.getElementById("step2").style.display = "block";
    window.scrollTo({top:0,behavior:"smooth"});
  });

  document.getElementById("backToStart").addEventListener("click", () => {
    document.getElementById("step2").style.display = "none";
    document.getElementById("step1").style.display = "block";
  });

  document.getElementById("addType").addEventListener("click", addTypeRow);
  document.getElementById("sendWhatsApp").addEventListener("click", sendWhatsApp);
});

function addTypeRow(){
  const list = document.getElementById("typesList");
  const idx = list.children.length + 1;
  const row = document.createElement("div");
  row.className = "grid grid-2";
  row.style.marginBottom = "10px";
  row.innerHTML = `
    <div>
      <label>نوع الشحنة <span class="req">*</span></label>
      <input type="text" placeholder="مثال: برميل مواد غذائية" class="typeName">
    </div>
    <div>
      <label>نوع الشحن</label>
      <select class="shipKind">
        <option value="عادي">شحن عادي</option>
        <option value="سريع">شحن سريع</option>
      </select>
    </div>
    <div>
      <label>الوزن (كجم) <span class="req">*</span></label>
      <input type="number" min="0" step="0.1" placeholder="0" class="typeWeight">
    </div>
    <div>
      <label>الأبعاد (ط × ع × ا) سم <span class="req">*</span></label>
      <input type="text" placeholder="الطول × العرض × الارتفاع" class="typeDims">
    </div>
  `;
  list.appendChild(row);
}

function collectTypes(){
  const rows = [...document.querySelectorAll("#typesList .grid")];
  const items = [];
  let ok = true;
  rows.forEach(r => {
    const name = r.querySelector(".typeName");
    const weight = r.querySelector(".typeWeight");
    const dims = r.querySelector(".typeDims");
    const kind = r.querySelector(".shipKind");

    [name,weight,dims].forEach(el => {
      if(!el.value.trim()){ el.classList.add("error"); ok=false; } else el.classList.remove("error");
    });

    items.push({
      name: name.value.trim(),
      weight: weight.value.trim(),
      dims: dims.value.trim(),
      kind: kind.value
    });
  });
  return {ok, items};
}

function sendWhatsApp(){
  const {ok, items} = collectTypes();
  if(!ok){ alert("يرجى إكمال تفاصيل الشحنات (النوع/الوزن/الأبعاد)."); return; }

  if(items.length === 0){ alert("أضف على الأقل نوع شحنة واحد."); return; }

  const cityKSA = document.getElementById("cityKSA").value;
  const stateSD = document.getElementById("stateSD").value;
  const citySD = document.getElementById("citySD").value;
  const countryCode = document.getElementById("countryCode").value;
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  const lines = [];
  lines.push("طلب شحن جديد (بدون أسعار)");
  lines.push("— — — — — —");
  lines.push(`من (مدينة بالسعودية): ${cityKSA}`);
  lines.push(`إلى (ولاية بالسودان): ${stateSD}`);
  lines.push(`مدينة الاستلام: ${citySD}`);
  lines.push("");
  lines.push("تفاصيل الشحنات:");
  items.forEach((it,i)=>{
    lines.push(`${i+1}) ${it.name} — نوع الشحن: ${it.kind} — الوزن: ${it.weight} كجم — الأبعاد: ${it.dims}`);
  });
  lines.push("");
  lines.push(`عنوان العميل: ${address}`);
  lines.push(`هاتف العميل: ${countryCode} ${phone}`);
  lines.push("");
  lines.push("الدفع: عند الاستلام فقط");

  const msg = encodeURIComponent(lines.join("\n"));
  const dest = "00966542354559"; // your WhatsApp
  const url = `https://wa.me/${dest}?text=${msg}`;
  window.open(url, "_blank");
}
