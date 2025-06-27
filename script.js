// O'zingizning qiymatlaringizni kiriting!
const BOT_TOKEN = '7622026084:AAFUy3d8unjjJlNRT9ZFtUq_b_SO4lZT7mY';
const CHAT_ID = '@javascriptprocets';

const form = document.getElementById('orderForm');
const successMsg = document.getElementById('successMsg');

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const phone = form.phone.value.trim();
  const from = form.from.value.trim();
  const to = form.to.value.trim();
  const promo = form.promo.value.trim();
  const phonePattern = /^\+?\d{10,15}$/;

  if (!phonePattern.test(phone)) {
    alert('Iltimos, to‘g‘ri telefon raqamini kiriting (masalan: +998123456789)');
    form.phone.focus();
    return;
  }

  const message = `🚕 Yangi taksi buyurtmasi!\n\n👤 Ism: ${name}\n📞 Telefon: ${phone}\n📍 Qayerdan: ${from}\n📍 Qayerga: ${to}`;

  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      form.style.display = 'none';
      successMsg.style.display = 'block';
    } else {
      alert('Yuborishda xatolik: ' + data.description);
    }
  })
  .catch(err => {
    alert('Tarmoq xatosi: ' + err);
  });
});

/* Slayder */
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;
const totalSlides = slides.length;
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle('active', i === index);
  });
}
function nextSlide() {
  currentSlide = (currentSlide + 1) % totalSlides;
  showSlide(currentSlide);
}
function prevSlide() {
  currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  showSlide(currentSlide);
}
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Avtomatik slayder
setInterval(nextSlide, 5000);

// Birinchi slaydni ko‘rsatish
showSlide(currentSlide);