/**
 * Функция для расчета выручки
 * @param {Object} purchase - запись о покупке, содержащая количество товара
 * @param {Object} _product - карточка товара, содержащая цену товара
 * @returns {number} - выручка от операции
 */
function calculateSimpleRevenue(purchase, _product) {
    if (!purchase.quantity || !purchase.quantity > 0) {
        return 0; 
    }
    

    if (!_product.price || _product.price < 0) {
        return 0; 
    }
    
    const revenue = purchase.quantity * _product.price;
    return revenue;
}

/**
 * Простая функция для расчета бонусов продавцам
    @param index порядковый номер в отсортированном массиве
    @param total общее число продавцов
    @param seller карточка продавца
    @returns {number}
 */
function calculateBonusByProfit(index, _total, seller) {
    const revenue = seller.revenue || 0;
    
    if (index === 1) return revenue * 0.1;  
    if (index === 2) return revenue * 0.05; 
    if (index === 3) return revenue * 0.03; 
    
    return revenue * 0.01; 
}


/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {

    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Данные о продажах должны быть непустым массивом.");
    }


    const { calculateBonus } = options || {};
    if (typeof calculateBonus !== 'function') {
        throw new Error("Необходимо предоставить функцию для расчета бонусов.");
    }


    const sellers = {};

   
    data.forEach(sale => {
        const { seller_id, product_id, revenue, profit } = sale;

        if (!sellers[seller_id]) {
            sellers[seller_id] = {
                name: sale.seller_name,
                revenue: 0,
                profit: 0,
                sales_count: 0,
                top_products: {}
            };
        }


        sellers[seller_id].revenue += revenue;
        sellers[seller_id].profit += profit;
        sellers[seller_id].sales_count += 1;


        if (!sellers[seller_id].top_products[product_id]) {
            sellers[seller_id].top_products[product_id] = 0;
        }
        sellers[seller_id].top_products[product_id] += revenue;
    });

    const sortedSellers = Object.entries(sellers).map(([seller_id, data]) => ({
        seller_id,
        ...data,
        top_products: Object.entries(data.top_products)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3) 
            .map(([product_id, revenue]) => ({ product_id, revenue }))
    })).sort((a, b) => b.profit - a.profit);


    sortedSellers.forEach((seller, index) => {
        seller.bonus = calculateBonus(index + 1, sortedSellers.length, seller);
    });


    return sortedSellers.map(({ seller_id, name, revenue, profit, sales_count, bonus, top_products }) => ({
        seller_id,
        name,
        revenue,
        profit,
        sales_count,
        bonus,
        top_products
    }));
}

