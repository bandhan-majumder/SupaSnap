import { Image } from "expo-image";
import { Asset, getAlbumsAsync, getAssetsAsync } from "expo-media-library";
import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

export default function MediaLibrary() {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    getAlbums();
  }, []);

  async function getAlbums() {
    const fetchAlbumns = await getAlbumsAsync();
    const albumAsset = await getAssetsAsync({
      // album: fetchAlbumns[0],
      mediaType: "photo",
      sortBy: "creationTime",
      first: 40,
    });
    setAssets(albumAsset.assets);
  }

  return (
    <>
      <ScrollView
        contentContainerStyle={{
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {assets.map((photo) => (
          <Image
            key={photo.id}
            source={{ uri: photo.uri }}
            style={{
              width: "25%",
              height: 100,
            }}
          />
        ))}
      </ScrollView>
    </>
  );
}
