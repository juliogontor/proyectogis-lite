CREATE OR REPLACE FUNCTION get_colonia_mvt(z integer, x integer, y integer)
RETURNS bytea AS $$
DECLARE
  mvt bytea;
BEGIN
  SELECT ST_AsMVT(tile, 'colonia', 4096, 'geom') INTO mvt
  FROM (
    SELECT 
      id, 
      ST_AsMVTGeom(
        geom, 
        ST_TileEnvelope(z, x, y), 
        4096, 64, true
      ) AS geom
    FROM colonia
    WHERE ST_Intersects(geom, ST_Tilenvelope(z, x, y))
  ) AS tile;
  
  RETURN mvt;
END;
$$ LANGUAGE plpgsql STABLE;