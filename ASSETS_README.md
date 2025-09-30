# Hotel Ensueños - Assets and Images Guide

## Overview

This document explains how to manage images, icons, and other assets for the Hotel Ensueños website.

## Directory Structure

```
public/
├── icons/           # SVG icons for amenities and features
├── rooms/           # Room images (JPG/PNG/WebP)
├── tourism/         # Tourism destination images
└── gastronomy/      # Food and restaurant images

src/
├── data/           # JSON data files (no images here)
├── styles/         # CSS files
└── components/     # Components (no images here)
```

## Icons (public/icons/)

### Available Icons

- `wifi.svg` - Wi-Fi connectivity icon
- `pool.svg` - Swimming pool icon
- `spa.svg` - Spa and wellness icon

### Adding New Icons

1. Create SVG files in `public/icons/`
2. Use `currentColor` for fill color so icons inherit text color
3. Recommended size: 24x24px viewBox
4. Update the amenities data in `src/data/hotel.json` or `src/data/rooms.json`

### Example Icon Usage

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
</svg>
```

## Room Images (public/rooms/)

### Required Images for Each Room

Each room should have:
- `main.jpg` - Main room photo (hero image)
- `gallery1.jpg`, `gallery2.jpg`, etc. - Gallery images

### Image Specifications

- **Format**: JPG, PNG, or WebP
- **Main image**: 1200x800px (3:2 ratio)
- **Gallery images**: 800x600px (4:3 ratio)
- **File size**: Optimize for web (< 200KB per image)
- **Alt text**: Provide in both Spanish and English

### Naming Convention

```
public/rooms/
├── standard/
│   ├── main.jpg          # Main room photo
│   ├── gallery1.jpg      # Bathroom view
│   └── gallery2.jpg      # Room detail
├── deluxe/
│   ├── main.jpg
│   └── gallery1.jpg
└── suite/
    ├── main.jpg
    ├── gallery1.jpg
    ├── gallery2.jpg
    └── gallery3.jpg
```

## Tourism Images (public/tourism/)

### Required Images for Each Destination

- One main image per destination
- Format: JPG, PNG, or WebP
- Recommended size: 800x600px (4:3 ratio)
- File size: < 150KB

### Naming Convention

```
public/tourism/
├── cuenca-historic-center.jpg
├── cajas-national-park.jpg
└── ingapirca-ruins.jpg
```

## Gastronomy Images (public/gastronomy/)

### Required Images for Each Dish

- One main image per dish
- Format: JPG, PNG, or WebP
- Recommended size: 600x400px (3:2 ratio)
- File size: < 100KB

### Naming Convention

```
public/gastronomy/
├── hornado-cuencano.jpg
├── locro-soup.jpg
└── ceviche.jpg
```

## Hero Images and Videos (public/hero/)

### Hero Section Assets

- Images: `1.jpg`, `2.jpg`, etc.
- Videos: `1.mp4`, `2.mp4`, etc.
- Update `src/data/siteConfig.json` heroResources array

### Specifications

- **Images**: 1920x1080px (16:9 ratio)
- **Videos**: 1920x1080px, H.264 codec, < 5MB
- **Mobile optimization**: Videos excluded on mobile devices

## Performance Optimization

### Image Optimization Tips

1. **Compress images** before uploading
2. **Use WebP format** for better compression
3. **Implement lazy loading** (already configured)
4. **Use appropriate sizes** for different screen sizes

### Tools for Image Optimization

- **TinyPNG** - PNG/JPG compression
- **Squoosh** - Modern image optimization
- **ImageOptim** - Mac optimization tool
- **Sharp** - Node.js image processing (used in production)

## Adding New Asset Types

### 1. Update Data Files

Add new asset references to the appropriate JSON files:

```json
{
  "amenities": [
    {
      "id": "new-amenity",
      "name": { "es": "Nueva Amenidad", "en": "New Amenity" },
      "svgPath": "/icons/new-amenity.svg"
    }
  ]
}
```

### 2. Create Asset Files

1. Add the actual file to the correct directory
2. Test that the path is accessible
3. Verify responsive behavior

### 3. Update Components

If needed, update components to handle the new asset type.

## Best Practices

### Accessibility

- Always provide alt text for images
- Use descriptive file names
- Ensure good contrast for overlaid text

### Performance

- Optimize all images before deployment
- Use appropriate image formats
- Implement lazy loading for below-the-fold content
- Consider using CDN for production

### SEO

- Use descriptive alt text with keywords
- Choose high-quality, relevant images
- Optimize file names for search engines

## Deployment Notes

### Production Assets

1. Run `pnpm build` to generate optimized assets
2. All assets in `public/` are copied to `dist/` during build
3. Configure CDN for better performance if needed

### Missing Assets

The application gracefully handles missing assets by:
- Showing placeholders for missing images
- Logging warnings for missing icons
- Continuing to function with reduced visual elements

## Troubleshooting

### Common Issues

1. **Images not loading**: Check file paths and permissions
2. **Icons not displaying**: Verify SVG syntax and currentColor usage
3. **Performance issues**: Check image file sizes and compression

### Debug Mode

Enable debug logging to see asset loading information:

```javascript
// In development
localStorage.setItem('hotel-debug-assets', 'true');
```

## Support

For questions about asset management, refer to:
- This documentation
- The main project README
- The development team

---

*Last updated: 2024-12-29*
*Version: 1.0.0*