import React, { useState } from 'react';
import { motion } from 'framer-motion';

const filters = ['For You', 'Communities', 'Network'];

export function FeedFilters({ onChange }: { onChange?: (value: string) => void }) {
  const [active, setActive] = useState('For You');

  return (
    <div className="feed-filters" role="tablist" aria-label="Feed filter tabs">
      {filters.map((filter) => {
        const isSelected = active === filter;
        return (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={`filter-tab ${isSelected ? 'selected' : ''}`}
            onClick={() => {
              setActive(filter);
              onChange?.(filter);
            }}
          >
            {isSelected && (
              <motion.span
                layoutId="activeFilterPill"
                className="filter-tab-indicator"
                transition={{ type: 'spring', stiffness: 500, damping: 32 }}
              />
            )}
            <span className="filter-tab-label">{filter}</span>
          </button>
        );
      })}
    </div>
  );
}
