import React from 'react';

interface DropdownFacetsProps {
  dateFacets: Array<{val: string, count: number}>;
  sizeFacets: Array<{val: string, count: number}>;
  siteFacets: Array<{val: string, count: number}>;
  onSelectFacet: (facetType: string, facetValue: string) => void;
}

const DropdownFacets: React.FC<DropdownFacetsProps> = ({ 
  dateFacets = [], 
  sizeFacets = [], 
  siteFacets = [], 
  onSelectFacet 
}) => {
  return (
    //<div className="flex space-x-4 p-4 bg-base-100 rounded-box">
    <div className="menu bg-base-200 rounded-box fixed w-56 top-20 ">
      {/* Date Facets Dropdown */}
      <div className="dropdown dropdown-hover">
        <div tabIndex={0} role="button" className="btn m-1">Fecha</div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-white-100 rounded-box w-52">
          {dateFacets.length > 0 ? (
            dateFacets.map((facet, index) => (
              <li key={index}>
                <a onClick={() => onSelectFacet('date', facet.val)}>
                  {facet.val} ({facet.count})
                </a>
              </li>
            ))
          ) : (
            <li><span className="text-gray-500">No hay facetas de fecha</span></li>
          )}
        </ul>
      </div>

      {/* Size Facets Dropdown */}
      <div className="dropdown dropdown-hover">
        <div tabIndex={0} role="button" className="btn m-1">Tamaño</div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          {sizeFacets.length > 0 ? (
            sizeFacets.map((facet, index) => (
              <li key={index}>
                <a onClick={() => onSelectFacet('size', facet.val)}>
                  {facet.val} bytes ({facet.count})
                </a>
              </li>
            ))
          ) : (
            <li><span className="text-gray-500">No hay facetas de tamaño</span></li>
          )}
        </ul>
      </div>

      {/* Site Facets Dropdown */}
      <div className="dropdown dropdown-hover">
        <div tabIndex={0} role="button" className="btn m-1">Sitios</div>
        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          {siteFacets.length > 0 ? (
            siteFacets.map((facet, index) => (
              <li key={index}>
                <a onClick={() => onSelectFacet('site', facet.val)}>
                  {facet.val} ({facet.count})
                </a>
              </li>
            ))
          ) : (
            <li><span className="text-gray-500">No hay facetas de sitios</span></li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DropdownFacets;
