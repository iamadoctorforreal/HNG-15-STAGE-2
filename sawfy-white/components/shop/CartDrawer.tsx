'use client';

import React from 'react';
import { useCart } from '@/hooks/useCart';
import Image from 'next/image';

export function CartDrawer({ locale = 'en' }: { locale?: string }) {
  const {
    items,
    isOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    totalItems,
    subtotal,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#FAF8F5]">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛒</span>
              <h2 className="font-bold text-lg text-gray-900 font-serif">
                Your Shopping Cart
              </h2>
              <span className="bg-[#008751] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {totalItems}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 text-sm font-bold"
            >
              ✕
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <span className="text-5xl block mb-3">🐟</span>
                <p className="font-semibold text-gray-700">Your cart is empty</p>
                <p className="text-xs text-gray-400 mt-1">
                  Add some delicious export-grade Abeokuta catfish or our recipe cookbook!
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.id}-${item.variantId}`} className="py-4 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 relative overflow-hidden shrink-0 border border-gray-200">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🐟
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">
                      {item.title}
                    </h3>
                    {item.variantTitle && (
                      <p className="text-xs text-[#008751] font-medium">
                        {item.variantTitle}
                      </p>
                    )}
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      ₦{item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Quantity adjustment */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.id, -1, item.variantId)}
                        className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1, item.variantId)}
                        className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id, item.variantId)}
                      className="text-[11px] text-red-500 hover:text-red-700 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-gray-200 bg-[#FAF8F5] space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-xl font-bold text-[#006b3f]">
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Shipping and taxes calculated during checkout.
              </p>
              <a
                href={`/${locale}/checkout`}
                onClick={closeCart}
                className="w-full py-3 bg-[#008751] hover:bg-[#006b3f] text-white font-bold rounded-lg text-center block text-sm shadow-md hover:shadow-lg transition-all"
              >
                Proceed to Checkout • ₦{subtotal.toLocaleString()}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
