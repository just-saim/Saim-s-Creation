const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend/dist')));
app.use(express.static(path.join(__dirname, 'frontend/public')));
app.use('/uploads', express.static(uploadsDir));

let products = [];
let orders = [];

const adj = ['Zari Border', 'Embroidered', 'Bridal', 'Mirror Work', 'Chikankari', 'Handloom', 'Printed', 'Silk', 'Velvet', 'Net', 'Georgette', 'Chiffon', 'Gota Patti', 'Zardosi', 'Banarasi'];
const typesMap = {
    'Sarees': ['Saree', 'Drape Saree', 'Ruffle Saree', 'Half Saree'],
    'Suits': ['3-Piece Suit', 'Kurta Set', 'Anarkali', 'Sharara Suit', 'Palazzo Set'],
    'Lehenga': ['Lehenga Choli', 'Crop Top Lehenga', 'Jacket Lehenga'],
    'Garara': ['Garara Set', 'Heavy Garara', 'Party Wear Garara']
};
const allColors = ['Red', 'Blue', 'Green', 'Gold', 'Black', 'Maroon', 'Teal', 'Ivory'];
const occs = ['Wedding', 'Party', 'Festive', 'Casual'];
const sizeOpts = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function initData() {
    products.push({ id: 'P0', name: "Zari Border Banarasi Saree", price: 12500, category: 'Sarees', occasion: 'Wedding', colors: ['Red', 'Gold'], stock: 5, featured: true, sizes: ['Onesize'], image: '/Img/1779200209898.jpg', images: ['/Img/1779200209898.jpg'] });
    products.push({ id: 'P1', name: "Embroidered Lawn 3-Piece Suit", price: 4800, category: 'Suits', occasion: 'Casual', colors: ['Blue', 'Ivory'], stock: 15, featured: false, sizes: ['S', 'M', 'L'], image: null, images: [] });
    products.push({ id: 'P2', name: "Bridal Lehenga Choli with Dupatta", price: 38000, category: 'Lehenga', occasion: 'Wedding', colors: ['Maroon', 'Gold'], stock: 2, featured: true, sizes: ['M', 'L'], image: null, images: [] });
    products.push({ id: 'P3', name: "Mirror Work Garara Set", price: 9200, category: 'Garara', occasion: 'Party', colors: ['Teal', 'Green'], stock: 8, featured: true, sizes: ['S', 'M', 'L'], image: null, images: [] });
    products.push({ id: 'P4', name: "Chikankari Kurta Dupatta Set", price: 6500, category: 'Suits', occasion: 'Festive', colors: ['Ivory', 'Gold'], stock: 0, featured: false, sizes: ['M', 'L', 'XL'], image: null, images: [] });
    
    while(products.length < 64) {
        let c = Object.keys(typesMap)[Math.floor(Math.random()*4)];
        let t = typesMap[c][Math.floor(Math.random()*typesMap[c].length)];
        let a = adj[Math.floor(Math.random()*adj.length)];
        let p = (Math.floor(Math.random() * 45) + 3) * 1000;
        products.push({
            id: 'P' + products.length,
            name: `${a} ${t}`,
            price: p,
            category: c,
            occasion: occs[Math.floor(Math.random()*occs.length)],
            colors: allColors.sort(() => 0.5 - Math.random()).slice(0, 2),
            stock: Math.floor(Math.random() * 15),
            featured: Math.random() > 0.8,
            sizes: c==='Sarees' ? ['Onesize'] : sizeOpts,
            image: null,
            images: []
        });
    }

    for(let i=1; i<=8; i++) {
        orders.push({
            id: 'SC-2024-' + (1000 + i),
            customer: 'Customer ' + i,
            total: Math.floor(Math.random() * 50000) + 5000,
            method: ['Cash on Delivery', 'Bank Transfer', 'JazzCash'][Math.floor(Math.random()*3)],
            status: ['New', 'Processing', 'Shipped', 'Delivered'][Math.floor(Math.random()*4)],
            payStatus: ['Pending', 'Paid'][Math.floor(Math.random()*2)],
            date: new Date(Date.now() - Math.random()*1000000000).toLocaleDateString()
        });
    }
}
initData();

app.post('/api/upload', upload.array('images', 8), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }
    const imageUrls = req.files.map(f => `/uploads/${f.filename}`);
    res.json({ imageUrls, imageUrl: imageUrls[0] });
});

app.get('/api/products', (req, res) => res.json(products));
app.get('/api/orders', (req, res) => res.json(orders));
app.post('/api/orders', (req, res) => {
    const newOrder = req.body;
    if (newOrder.payStatus !== 'Paid') {
        newOrder.method = 'Cash on Delivery';
        newOrder.payStatus = 'Pending';
    }
    orders.unshift(newOrder);
    res.json({ success: true, order: newOrder });
});

app.put('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const { status, payStatus, method } = req.body;
    const order = orders.find(o => o.id === id);
    if(order) {
        if(status !== undefined) order.status = status;
        if(payStatus !== undefined) order.payStatus = payStatus;
        if(method !== undefined) order.method = method;
        res.json(order);
    } else {
        res.status(404).json({ error: 'Order not found' });
    }
});

app.post('/api/admin/login', (req, res) => {
    const { user, pass } = req.body;
    if(user === 'admin' && pass === 'admin123') {
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

app.post('/api/products', (req, res) => {
    console.log("POST /api/products received:", req.body);
    const newProd = req.body;
    // ensure it has an ID
    newProd.id = 'P' + (products.length + 1) + '-' + Math.floor(Math.random() * 1000);
    products.unshift(newProd);
    console.log("Added new product:", newProd.id);
    res.json(newProd);
});

app.put('/api/products/:id', (req, res) => {
    console.log("PUT /api/products/" + req.params.id + " received:", req.body);
    const { id } = req.params;
    const { name, price, category, image, images, stock, sizes, colors, occasion } = req.body;
    const prod = products.find(p => p.id === id);
    if(prod) {
        if(name !== undefined) prod.name = name;
        if(price !== undefined) prod.price = price;
        if(category !== undefined) prod.category = category;
        if(image !== undefined) prod.image = image;
        if(images !== undefined) prod.images = images;
        if(stock !== undefined) prod.stock = stock;
        if(sizes !== undefined) prod.sizes = sizes;
        if(colors !== undefined) prod.colors = colors;
        if(occasion !== undefined) prod.occasion = occasion;
        console.log("Successfully updated product:", id);
        res.json(prod);
    } else {
        console.log("Failed to find product:", id);
        res.status(404).json({ error: 'Product not found' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    console.log("DELETE /api/products/" + req.params.id + " received");
    const { id } = req.params;
    const index = products.findIndex(p => p.id === id);
    if(index !== -1) {
        products.splice(index, 1);
        console.log("Successfully deleted product:", id);
        res.json({ success: true });
    } else {
        console.log("Failed to find product to delete:", id);
        res.status(404).json({ error: 'Product not found' });
    }
});

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
