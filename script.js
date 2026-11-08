/* ======================================
   BOOKSPACE - JAVASCRIPT UTAMA
====================================== */

// ======================================
// 1. FUNGSI LOGIN
// ======================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const pengguna = dataPengguna.find(function(user) {
            return user.email.toLowerCase() === email.toLowerCase()
                && user.password === password;
        });

        if (pengguna) {

            localStorage.setItem(
                "bookspaceUser",
                JSON.stringify({
                    id: pengguna.id,
                    nama: pengguna.nama,
                    email: pengguna.email,
                    role: pengguna.role
                })
            );

            alert("Login berhasil! Selamat datang di BOOKSPACE.");

            window.location.href = "dashboard.html";

        } else {

            alert("Login gagal! Email atau password salah.");

        }

    });

}


// ======================================
// 2. FUNGSI PEMESANAN BUKU
// ======================================

const checkoutForm = document.getElementById("checkoutForm");

if (checkoutForm) {

    const pilihBuku = document.getElementById("pilihBuku");
    const jumlahBuku = document.getElementById("jumlahBuku");
    const hargaBuku = document.getElementById("hargaBuku");
    const totalHarga = document.getElementById("totalHarga");

    // Mengubah harga menjadi angka
    function ubahHargaAngka(harga) {
        return Number(String(harga).replace(/[^\d]/g, ""));
    }

    // Format Rupiah
    function formatRupiah(angka) {
        return angka.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        });
    }

    // Menampilkan katalog buku
    dataKatalogBuku.forEach(function(buku) {

        const option = document.createElement("option");

        option.value = buku.kodeBarang;

        option.textContent =
            buku.namaBarang + " - " + buku.harga +
            " (Stok: " + buku.stok + ")";

        if (buku.stok <= 0) {
            option.disabled = true;
        }

        pilihBuku.appendChild(option);

    });

    // Menghitung total pembayaran
    function hitungTotal() {

        const buku = dataKatalogBuku.find(function(item) {
            return item.kodeBarang === pilihBuku.value;
        });

        if (!buku) {
            hargaBuku.textContent = "Rp 0";
            totalHarga.textContent = "Rp 0";
            return;
        }

        const harga = ubahHargaAngka(buku.harga);
        const jumlah = Number(jumlahBuku.value) || 0;

        hargaBuku.textContent = formatRupiah(harga);

        totalHarga.textContent = formatRupiah(
            harga * jumlah
        );

    }

    pilihBuku.addEventListener("change", hitungTotal);
    jumlahBuku.addEventListener("input", hitungTotal);

    // Proses penyimpanan pesanan
    checkoutForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const nama = document.getElementById("namaPembeli").value.trim();
        const alamat = document.getElementById("alamatPembeli").value.trim();
        const telepon = document.getElementById("nomorTelepon").value.trim();

        const buku = dataKatalogBuku.find(function(item) {
            return item.kodeBarang === pilihBuku.value;
        });

        const jumlah = Number(jumlahBuku.value);

        if (!buku) {
            alert("Silakan pilih buku terlebih dahulu!");
            return;
        }

        if (!Number.isInteger(jumlah) || jumlah < 1) {
            alert("Jumlah pembelian tidak valid!");
            return;
        }

        if (jumlah > buku.stok) {
            alert("Stok buku tidak mencukupi!");
            return;
        }

        const harga = ubahHargaAngka(buku.harga);
        const total = harga * jumlah;

        const daftarPesanan = JSON.parse(
            localStorage.getItem("bookspaceOrders")
        ) || [];

        const pesananBaru = {

            nomorDO: "DO" + Date.now(),
            nama: nama,
            alamat: alamat,
            telepon: telepon,
            kodeBarang: buku.kodeBarang,
            namaBarang: buku.namaBarang,
            jumlah: jumlah,
            harga: harga,
            total: total,
            status: "Diproses",
            tanggal: new Date().toLocaleString("id-ID")

        };

        if (nomorDOYangDiubah) {

    const indexPesanan = daftarPesanan.findIndex(
        item => item.nomorDO === nomorDOYangDiubah
    );

    if (indexPesanan !== -1) {
        pesananBaru.nomorDO = nomorDOYangDiubah;

        pesananBaru.status = daftarPesanan[indexPesanan].status;
        pesananBaru.tanggal = daftarPesanan[indexPesanan].tanggal;

        daftarPesanan[indexPesanan] = pesananBaru;
    }

    nomorDOYangDiubah = null;

    alert("Pesanan berhasil diperbarui!");

} else {

    daftarPesanan.push(pesananBaru);

    alert(
        "Pesanan berhasil dibuat!\n" +
        "Nomor DO: " + pesananBaru.nomorDO +
        "\nTotal: " + formatRupiah(total)
    );
}

localStorage.setItem(
    "bookspaceOrders",
    JSON.stringify(daftarPesanan)
);

tampilkanDaftarPesanan();

        checkoutForm.reset();

        jumlahBuku.value = 1;

        hitungTotal();

    });

}

// MENAMPILKAN DAFTAR PESANAN
const daftarPesananBody = document.getElementById("daftarPesananBody");
const pesananKosong = document.getElementById("pesananKosong");

function tampilkanDaftarPesanan() {
    if (!daftarPesananBody) return;

    const daftarPesanan = JSON.parse(
        localStorage.getItem("bookspaceOrders") || "[]"
    );

    daftarPesananBody.innerHTML = "";

    pesananKosong.style.display =
        daftarPesanan.length === 0 ? "block" : "none";

    daftarPesanan
    .filter(pesanan =>
        pesanan.nomorDO &&
        pesanan.nama &&
        pesanan.namaBarang
    )
    .forEach(pesanan => {
        const baris = document.createElement("tr");

        baris.innerHTML = `
            <td style="padding:12px;">${pesanan.nomorDO}</td>
            <td style="padding:12px;">${pesanan.nama}</td>
            <td style="padding:12px;">${pesanan.namaBarang}</td>
            <td style="padding:12px;">${formatRupiah(pesanan.total)}</td>
            <td style="padding:12px;">
                <button type="button"
                    onclick="ubahPesanan('${pesanan.nomorDO}')">
                    Ubah
                </button>
            </td>
        `;

        daftarPesananBody.appendChild(baris);
    });
}

// Menyimpan nomor DO yang sedang diedit
let nomorDOYangDiubah = null;

// Fungsi mengubah pesanan
function ubahPesanan(nomorDO) {
    const daftarPesanan = JSON.parse(
        localStorage.getItem("bookspaceOrders") || "[]"
    );

    const pesanan = daftarPesanan.find(
        item => item.nomorDO === nomorDO
    );

    if (!pesanan) {
        alert("Pesanan tidak ditemukan!");
        return;
    }

    nomorDOYangDiubah = nomorDO;

    document.getElementById("namaPembeli").value = pesanan.nama;
    document.getElementById("alamatPembeli").value = pesanan.alamat;
    document.getElementById("nomorTelepon").value = pesanan.telepon;
    document.getElementById("pilihBuku").value = pesanan.kodeBarang;
    document.getElementById("jumlahBuku").value = pesanan.jumlah;

    document.getElementById("pilihBuku").dispatchEvent(
        new Event("change")
    );

    document.getElementById("jumlahBuku").dispatchEvent(
        new Event("input")
    );

    document.getElementById("checkoutForm").scrollIntoView({
        behavior: "smooth"
    });

    alert("Data pesanan berhasil dimuat. Silakan ubah data yang diperlukan.");
}

// Jalankan saat halaman dibuka
tampilkanDaftarPesanan();

// ======================================
// 3. FUNGSI LOGOUT
// ======================================

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener("click", function(event) {

        event.preventDefault();

        if (confirm("Apakah kamu yakin ingin keluar?")) {

            localStorage.removeItem("bookspaceUser");

            window.location.href = "index.html";

        }

    });

}


/* ======================================
   4. FUNGSI TRACKING PENGIRIMAN
====================================== */

const trackingForm = document.getElementById("trackingForm");

if (trackingForm) {
    trackingForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const nomorDO = document.getElementById("nomorDO").value.trim();

        const hasil = document.getElementById("trackingResult");
        const info = document.getElementById("trackingInfo");
        const riwayat = document.getElementById("trackingHistory");

        // Cari pesanan dari data dosen
        let pesanan = dataTracking[nomorDO];

        // Jika tidak ditemukan, cari pesanan dari Checkout
        if (!pesanan) {
            const daftarPesanan = JSON.parse(
                localStorage.getItem("bookspaceOrders") || "[]"
            );

            pesanan = daftarPesanan.find(
                item => item.nomorDO === nomorDO
            );
        }

        hasil.hidden = false;
        info.innerHTML = "";
        riwayat.innerHTML = "";

        if (!pesanan) {
            info.innerHTML = `
                <p style="color:red;">
                    Nomor DO tidak ditemukan. Silakan periksa kembali.
                </p>
            `;
            return;
        }

        info.innerHTML = `
            <div class="tracking-info-grid">
                <div class="tracking-info-item">
                    <span>Nomor DO</span>
                    <strong>${pesanan.nomorDO}</strong>
                </div>
                <div class="tracking-info-item">
                    <span>Nama Pembeli</span>
                    <strong>${pesanan.nama}</strong>
                </div>
                <div class="tracking-info-item">
                    <span>Nama Buku</span>
                    <strong>${pesanan.namaBarang || pesanan.paket}</strong>
                </div>
                <div class="tracking-info-item">
                    <span>Total Pembayaran</span>
                    <strong>${pesanan.total}</strong>
                </div>
                <div class="tracking-info-item">
                    <span>Status</span>
                    <strong>${pesanan.status}</strong>
                </div>
            </div>
        `;

        if (pesanan.perjalanan) {
            const timeline = document.createElement("div");
            timeline.className = "tracking-timeline";

            pesanan.perjalanan.forEach(item => {
                const event = document.createElement("div");
                event.className = "tracking-event";

                const judul = document.createElement("strong");
                judul.textContent = item.status;

                const tanggal = document.createElement("p");
                tanggal.textContent = item.tanggal;

                event.appendChild(judul);
                event.appendChild(tanggal);
                timeline.appendChild(event);
            });

            riwayat.appendChild(timeline);
        } else {
            riwayat.innerHTML = `
                <p>Pesanan berhasil dibuat dan sedang diproses.</p>
                <p>Tanggal pesanan: ${pesanan.tanggal}</p>
            `;
        }
    });
}