import { useEffect, useMemo, useState, Suspense, useRef } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Html, useProgress, MeshReflectorMaterial } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import * as THREE from "three";
import "./DoorConfigurator.css";

// ДАННИТЕ ТРЯБВА ДА СА НАГОРЕ - ПРЕДИ ДА БЪДАТ ИЗПОЛЗВАНИ!
const DOOR_TYPES = [
  { value: "industrial", label: "Индустриална секционна врата", icon: "🏭" },
  { value: "garage", label: "Гаражна секционна врата", icon: "🚗" },
  { value: "sectional", label: "Секционна врата Thermo", icon: "❄️" },
  { value: "high-speed", label: "Високоскоростна врата", icon: "⚡" },
  { value: "fire-resistant", label: "Противопожарна врата", icon: "🔥" },
];

const COLORS = [
  { name: "Бял RAL 9016", hex: "#FFFFFF" },
  { name: "Сребрист RAL 9006", hex: "#A5A5A5" },
  { name: "Сив RAL 7037", hex: "#7A7A7A" },
  { name: "Антрацит RAL 7016", hex: "#374151" },
  { name: "Терракот RAL 8023", hex: "#964B00" },
  { name: "Зелен RAL 6005", hex: "#1A3C27" },
  { name: "Сив металик", hex: "#6B7280" },
  { name: "Бежов RAL 1014", hex: "#E7D7C1" },
  { name: "Черен RAL 9005", hex: "#0B0F19" },
  { name: "Графит RAL 7024", hex: "#4B5563" },
];

const MATERIALS = [
  { id: "steel", name: "Стоманен лист", thickness: "0.7mm" },
  { id: "aluminum", name: "Алуминиев панел", thickness: "45mm" },
  { id: "insulated", name: "Изолиран сандвич панел", thickness: "40/80mm" },
  { id: "pvc", name: "PVC секции", thickness: "35mm" },
];

const WICKET_ALLOWED = new Set(["industrial", "garage", "sectional"]);

// Компонент за показване на прогреса на зареждане
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{
        color: 'white',
        fontSize: '14px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '12px 24px',
        borderRadius: '8px',
        border: '1px solid rgba(255, 102, 0, 0.3)'
      }}>
        Зареждане на 3D модел... {Math.round(progress)}%
      </div>
    </Html>
  );
}

// 3D модел на вратата
function DoorModel({ color, materialType, hasWindows, wicketDoor }) {
  const groupRef = useRef();
  const gltf = useLoader(GLTFLoader, "/models/garage_door.glb");
  
  // Клонираме сцената
  const scene = useMemo(() => {
    return gltf.scene.clone();
  }, [gltf.scene]);

  // Прилагаме материали и настройки
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Създаваме нов материал според избора
        let newMaterial;
        
        switch (materialType) {
          case 'steel':
            newMaterial = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(color),
              metalness: 0.9,
              roughness: 0.4,
              clearcoat: 1.0,
              clearcoatRoughness: 0.1,
              envMapIntensity: 1.0
            });
            break;
            
          case 'aluminum':
            newMaterial = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(color),
              metalness: 0.8,
              roughness: 0.3,
              clearcoat: 0.5,
              clearcoatRoughness: 0.2,
              envMapIntensity: 1.2
            });
            break;
            
          case 'insulated':
            newMaterial = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(color),
              metalness: 0.3,
              roughness: 0.6,
              clearcoat: 0.1,
              clearcoatRoughness: 0.4,
              envMapIntensity: 0.8
            });
            break;
            
          case 'pvc':
            newMaterial = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(color),
              metalness: 0.1,
              roughness: 0.7,
              clearcoat: 0.2,
              clearcoatRoughness: 0.3,
              envMapIntensity: 0.6
            });
            break;
            
          default:
            newMaterial = child.material.clone();
            newMaterial.color = new THREE.Color(color);
        }
        
        child.material = newMaterial;
        
        // Управление на прозорците
        if (child.name.toLowerCase().includes('window') || 
            child.name.toLowerCase().includes('glass')) {
          child.visible = hasWindows;
        }
        
        // Управление на проходната врата
        if (child.name.toLowerCase().includes('wicket') || 
            child.name.toLowerCase().includes('personnel')) {
          child.visible = wicketDoor;
        }
      }
    });
  }, [color, materialType, hasWindows, wicketDoor, scene]);

  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        position={[0, 0.5, 0]} 
        scale={[1.5, 1.5, 1.5]}
        rotation={[0, Math.PI / 4, 0]}
      />
    </group>
  );
}

// Плоча за отражения
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[10, 10]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#202020"
        metalness={0.5}
        mirror={0.8}
      />
    </mesh>
  );
}

// Осветление
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#FF6600" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        castShadow
        color="#ffffff"
      />
    </>
  );
}

// Основен 3D визуализатор
function Door3DViewer({ color, material, hasWindows, wicketDoor }) {
  const [hdri, setHdri] = useState(null);
  const [error, setError] = useState(false);
  
  // Зареждане на HDRI среда
  useEffect(() => {
    const loader = new RGBELoader();
    loader.load(
      'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/industrial_workshop_foundry_1k.hdr',
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        setHdri(texture);
      },
      undefined,
      (err) => {
        console.warn("Грешка при зареждане на HDRI:", err);
        setError(true);
      }
    );
  }, []);

  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #0B0F19 0%, #1a202c 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
        <h3 style={{ marginBottom: '0.5rem' }}>Грешка при зареждане</h3>
        <p style={{ color: '#9CA3AF', textAlign: 'center', maxWidth: '400px' }}>
          Моделът не може да бъде зареден. Моля, проверете дали файлът garage_door.glb е в папка public/models/
        </p>
      </div>
    );
  }

  return (
    <Canvas
      shadows
      camera={{ position: [5, 3, 5], fov: 45 }}
      style={{ 
        width: '100%', 
        height: '100%',
        background: 'linear-gradient(180deg, #0B0F19 0%, #1a202c 100%)'
      }}
    >
      <Suspense fallback={<Loader />}>
        {hdri && <Environment map={hdri} background blur={0.5} />}
        
        <DoorModel
          color={color}
          materialType={material}
          hasWindows={hasWindows}
          wicketDoor={wicketDoor}
        />
        
        <Ground />
        <Lighting />
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={2}
          maxDistance={10}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
        
        {/* Подсказка за контроли */}
        <Html position={[0, -1.5, 0]}>
          <div style={{
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: '12px',
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '8px 16px',
            borderRadius: '20px',
            whiteSpace: 'nowrap'
          }}>
          🖱️ Завъртете с ляв бутон | 📌 Придвижете с десен бутон | 🔍 Мащабирайте с колелцето
          </div>
        </Html>
      </Suspense>
    </Canvas>
  );
}

function DoorVisualization({ doorType, color, material, wicketDoor, hasWindows }) {
  const doorTypeLabel = DOOR_TYPES.find(d => d.value === doorType)?.label || "Секционна врата";
  const materialInfo = MATERIALS.find(m => m.id === material) || MATERIALS[0];
  
  return (
    <div className="dc-visualization-container">
      <div className="dc-visualization-header">
        <h2 className="dc-visualization-title">3D Визуализация на секционна врата</h2>
        <div className="dc-visualization-meta">
          <span className="dc-meta-chip">
            🏭 {doorTypeLabel}
          </span>
          <span className="dc-meta-chip">
            <span className="dc-meta-chip-dot" style={{ background: color }} />
            {COLORS.find(c => c.hex === color)?.name || "Цвят"}
          </span>
          <span className="dc-meta-chip">
            ⚙️ {materialInfo.name}
          </span>
          {wicketDoor && (
            <span className="dc-meta-chip">
              🚶 Проходна врата
            </span>
          )}
          {hasWindows && (
            <span className="dc-meta-chip">
              🔍 Прозорци
            </span>
          )}
        </div>
      </div>
      
      <div className="dc-svg-container">
        <Door3DViewer 
          color={color}
          material={material}
          hasWindows={hasWindows}
          wicketDoor={wicketDoor}
        />
      </div>
      
      {/* Легенда за детайлите */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem',
        marginTop: '1rem',
        padding: '1rem',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '20px', 
            height: '6px', 
            background: 'linear-gradient(90deg, rgba(0,0,0,0.6), rgba(100,100,100,0.3), rgba(0,0,0,0.6))',
            borderRadius: '2px' 
          }} />
          <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Усилващи ребра</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '16px', 
            height: '16px', 
            background: 'linear-gradient(135deg, #4a5568, #718096)', 
            borderRadius: '2px' 
          }} />
          <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Ханда</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ 
            width: '24px', 
            height: '24px', 
            background: 'rgba(173, 216, 230, 0.6)', 
            borderRadius: '4px', 
            border: '2px solid rgba(255,255,255,0.8)' 
          }} />
          <span style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Прозорец</span>
        </div>
      </div>
    </div>
  );
}

export default function DoorConfigurator() {
  const [doorType, setDoorType] = useState("industrial");
  const [color, setColor] = useState("#374151");
  const [material, setMaterial] = useState("insulated");
  const [wicketDoor, setWicketDoor] = useState(false);
  const [hasWindows, setHasWindows] = useState(false);
  const [windowCount, setWindowCount] = useState(3);
  
  const wicketAllowed = WICKET_ALLOWED.has(doorType);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!wicketAllowed && wicketDoor) setWicketDoor(false);
  }, [wicketAllowed, wicketDoor]);
  
  const selectedColorName = useMemo(() => {
    return COLORS.find(c => c.hex === color)?.name || "Персонализиран";
  }, [color]);
  
  const selectedMaterial = useMemo(() => {
    return MATERIALS.find(m => m.id === material) || MATERIALS[0];
  }, [material]);

  return (
    <div className="dc-premium-container">
      <div className="dc-premium-grid">
        {/* Лява част: 3D визуализация */}
        <DoorVisualization
          doorType={doorType}
          color={color}
          material={material}
          wicketDoor={wicketDoor}
          hasWindows={hasWindows}
        />

        {/* Дясна част: Контролен панел */}
        <div className="dc-control-panel">
          <div className="dc-control-header">
            <h1 className="dc-control-title">Конфигуратор на секционни врати</h1>
            <p className="dc-control-subtitle">
              Проектирайте вашата индустриална или гаражна врата с професионални опции.
            </p>
          </div>

          {/* Секция 1: Избор на тип врата */}
          <div className="dc-section-premium">
            <label className="dc-section-label">
              <span style={{ marginRight: '0.5rem' }}>🏭</span>
              Тип секционна врата
            </label>
            <select
              className="dc-select-premium"
              value={doorType}
              onChange={(e) => setDoorType(e.target.value)}
            >
              {DOOR_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#9CA3AF' }}>
              ⚙️ <strong>{DOOR_TYPES.find(t => t.value === doorType)?.label}</strong> - подходяща за индустриални обекти, гаражи и складове
            </div>
          </div>

          {/* Секция 2: Избор на материал */}
          <div className="dc-section-premium">
            <label className="dc-section-label">
              <span style={{ marginRight: '0.5rem' }}>🛡️</span>
              Материал и дебелина
            </label>
            <div className="dc-material-options">
              {MATERIALS.map((mat) => (
                <button
                  key={mat.id}
                  className={`dc-material-btn ${material === mat.id ? 'active' : ''}`}
                  onClick={() => setMaterial(mat.id)}
                >
                  <div className="dc-material-icon">
                    {mat.id === 'steel' && '🔩'}
                    {mat.id === 'aluminum' && '🔗'}
                    {mat.id === 'insulated' && '🧱'}
                    {mat.id === 'pvc' && '🧪'}
                  </div>
                  <div className="dc-material-info">
                    <strong>{mat.name}</strong>
                    <span>Дебелина: {mat.thickness}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Секция 3: Избор на цвят */}
          <div className="dc-section-premium">
            <div className="dc-toggle-container">
              <div>
                <div className="dc-section-label">
                  <span style={{ marginRight: '0.5rem' }}>🎨</span>
                  Цвят RAL и покритие
                </div>
                <div className="dc-toggle-subtitle">
                  Избран: <strong style={{ color: '#FF6600' }}>{selectedColorName}</strong>
                </div>
              </div>
              <div style={{
                background: color,
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: '3px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }} />
            </div>
            
            <div className="dc-colors-premium">
              {COLORS.map((colorObj) => (
                <button
                  key={colorObj.hex}
                  className={`dc-color-btn-premium ${color === colorObj.hex ? 'active' : ''}`}
                  style={{ 
                    background: colorObj.hex,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => setColor(colorObj.hex)}
                  title={colorObj.name}
                >
                  {color === colorObj.hex && (
                    <div style={{
                      position: 'absolute',
                      top: '2px',
                      right: '2px',
                      background: '#FF6600',
                      color: 'white',
                      fontSize: '10px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      ✓
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Секция 4: Допълнителни опции */}
          <div className="dc-section-premium">
            <div className="dc-options-grid">
              {/* Прозорци */}
              <div className="dc-option-group">
                <div className="dc-toggle-container">
                  <div className="dc-toggle-label">
                    <div className="dc-toggle-title">
                      <span style={{ marginRight: '0.5rem' }}>🔍</span>
                      Прозорци
                    </div>
                  </div>
                  <label className="dc-toggle-premium">
                    <input
                      type="checkbox"
                      checked={hasWindows}
                      onChange={(e) => setHasWindows(e.target.checked)}
                    />
                    <span className="dc-toggle-slider"></span>
                  </label>
                </div>
                
                {hasWindows && (
                  <div style={{ marginTop: '1rem' }}>
                    <label style={{ fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.5rem', display: 'block' }}>
                      Брой прозорци:
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={windowCount}
                      onChange={(e) => setWindowCount(parseInt(e.target.value))}
                      style={{ width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>1</span>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>{windowCount}</span>
                      <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>5</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Проходна врата */}
              <div className="dc-option-group">
                <div className="dc-toggle-container">
                  <div className="dc-toggle-label">
                    <div className="dc-toggle-title">
                      <span style={{ marginRight: '0.5rem' }}>🚶</span>
                      Проходна врата
                    </div>
                    <div className="dc-toggle-subtitle">
                      {wicketAllowed 
                        ? "Добавете малка врата в основната"
                        : "Недостъпно за избрания тип"}
                    </div>
                  </div>
                  
                  <label className="dc-toggle-premium">
                    <input
                      type="checkbox"
                      checked={wicketDoor}
                      onChange={(e) => setWicketDoor(e.target.checked)}
                      disabled={!wicketAllowed}
                    />
                    <span className="dc-toggle-slider"></span>
                  </label>
                </div>
                
                {!wicketAllowed && (
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: '#EF4444'
                  }}>
                    ⚠️ Недостъпно за този тип врата
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Секция 5: Резюме */}
          <div className="dc-summary-premium">
            <div className="dc-summary-title">Технически спецификации</div>
            
            <ul className="dc-summary-list">
              <li className="dc-summary-item">
                <span className="dc-summary-label">Тип врата:</span>
                <span className="dc-summary-value">{DOOR_TYPES.find(t => t.value === doorType)?.label}</span>
              </li>
              <li className="dc-summary-item">
                <span className="dc-summary-label">Материал:</span>
                <span className="dc-summary-value">{selectedMaterial.name} ({selectedMaterial.thickness})</span>
              </li>
              <li className="dc-summary-item">
                <span className="dc-summary-label">Цвят RAL:</span>
                <span className="dc-summary-value">{selectedColorName}</span>
              </li>
              <li className="dc-summary-item">
                <span className="dc-summary-label">Прозорци:</span>
                <span className="dc-summary-value">{hasWindows ? `ДА (${windowCount} бр.)` : 'НЕ'}</span>
              </li>
              <li className="dc-summary-item">
                <span className="dc-summary-label">Проходна врата:</span>
                <span className="dc-summary-value" style={{ color: wicketDoor ? '#10B981' : '#EF4444' }}>
                  {wicketDoor ? 'ДА' : 'НЕ'}
                </span>
              </li>
              <li className="dc-summary-item">
                <span className="dc-summary-label">Размери:</span>
                <span className="dc-summary-value">5000 x 4000 mm</span>
              </li>
            </ul>
            
            <button 
              className="dc-primary-btn-premium"
              onClick={() => {
                alert(`Запитване изпратено!\n\nТехнически спецификации:\n- Тип: ${DOOR_TYPES.find(t => t.value === doorType)?.label}\n- Материал: ${selectedMaterial.name}\n- Цвят: ${selectedColorName}\n- Прозорци: ${hasWindows ? `Да (${windowCount} бр.)` : 'Не'}\n- Проходна врата: ${wicketDoor ? 'Да' : 'Не'}`);
              }}
            >
              📧 Заявете оферта
            </button>
            
            <div style={{
              marginTop: '1rem',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#6B7280'
            }}>
              Ще получите детайлна оферта с технически чертежи
            </div>
          </div>
        </div>
      </div>
      
      {/* Легенда */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem',
        color: '#6B7280',
        fontSize: '0.875rem',
        background: 'rgba(30, 30, 30, 0.8)',
        padding: '1rem 2rem',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '2px',
            background: '#374151'
          }} />
          <span>Секционен дизайн</span>
        </div>
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '2px',
            background: '#FF6600'
          }} />
          <span>Усилващи ребра</span>
        </div>
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '2px',
            background: '#3B82F6'
          }} />
          <span>Полиуретаново уплътнение</span>
        </div>
      </div>
    </div>
  );
}