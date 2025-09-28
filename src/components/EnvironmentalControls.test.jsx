import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnvironmentalControls, { DISASTER_TYPES, CLIMATE_PARAMETERS } from './EnvironmentalControls';

describe('EnvironmentalControls', () => {
  const mockOnClimateChange = vi.fn();
  const mockOnDisasterTrigger = vi.fn();
  const mockOnResourceManipulation = vi.fn();

  const defaultProps = {
    onClimateChange: mockOnClimateChange,
    onDisasterTrigger: mockOnDisasterTrigger,
    onResourceManipulation: mockOnResourceManipulation,
    currentBiome: 'forest',
    isSimulationRunning: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders environmental controls with default climate panel', () => {
    render(<EnvironmentalControls {...defaultProps} />);
    
    expect(screen.getByText('🌍 Environmental Controls')).toBeInTheDocument();
    expect(screen.getByText('🌡️ Climate')).toBeInTheDocument();
    expect(screen.getByText('⚡ Disasters')).toBeInTheDocument();
    expect(screen.getByText('🍃 Resources')).toBeInTheDocument();
    
    // Climate controls should be visible by default
    expect(screen.getByText(/Temperature:/)).toBeInTheDocument();
    expect(screen.getByText(/Humidity:/)).toBeInTheDocument();
    expect(screen.getByText(/Seasonal Intensity:/)).toBeInTheDocument();
  });

  it('switches between panels correctly', async () => {
    const user = userEvent.setup();
    render(<EnvironmentalControls {...defaultProps} />);
    
    // Click disasters tab
    await user.click(screen.getByText('⚡ Disasters'));
    expect(screen.getByText('Disaster Type:')).toBeInTheDocument();
    expect(screen.getByText('🌪️ Trigger Disaster')).toBeInTheDocument();
    
    // Click resources tab
    await user.click(screen.getByText('🍃 Resources'));
    expect(screen.getByText('🍃 Add Food Sources')).toBeInTheDocument();
    expect(screen.getByText('🏔️ Terrain Modification')).toBeInTheDocument();
  });

  it('handles climate parameter changes', async () => {
    const user = userEvent.setup();
    render(<EnvironmentalControls {...defaultProps} />);
    
    const temperatureSlider = screen.getAllByDisplayValue('50')[0];
    fireEvent.change(temperatureSlider, { target: { value: '75' } });
    
    expect(mockOnClimateChange).toHaveBeenCalledWith({
      temperature: 75,
      humidity: 50,
      seasonalIntensity: 50
    });
  });

  it('shows correct climate effect descriptions', () => {
    render(<EnvironmentalControls {...defaultProps} />);
    
    // Check default descriptions
    expect(screen.getByText('Normal: Balanced conditions')).toBeInTheDocument();
    expect(screen.getByText('Normal: Balanced moisture levels')).toBeInTheDocument();
    expect(screen.getByText('Normal: Moderate seasonal changes')).toBeInTheDocument();
  });

  it('triggers disaster events correctly', async () => {
    const user = userEvent.setup();
    render(<EnvironmentalControls {...defaultProps} />);
    
    // Switch to disasters panel
    await user.click(screen.getByText('⚡ Disasters'));
    
    // Select a disaster type
    const disasterSelect = screen.getByDisplayValue('DROUGHT');
    await user.selectOptions(disasterSelect, 'flood');
    
    // Set intensity
    const intensitySlider = screen.getByDisplayValue('50');
    fireEvent.change(intensitySlider, { target: { value: '80' } });
    
    // Trigger disaster
    await user.click(screen.getByText('🌪️ Trigger Disaster'));
    
    expect(mockOnDisasterTrigger).toHaveBeenCalledWith({
      type: 'flood',
      intensity: 0.8,
      duration: 8,
      affectedBiome: 'forest'
    });
  });

  it('handles resource manipulation actions', async () => {
    const user = userEvent.setup();
    render(<EnvironmentalControls {...defaultProps} />);
    
    // Switch to resources panel
    await user.click(screen.getByText('🍃 Resources'));
    
    // Test adding food sources
    await user.click(screen.getByText('🍃 Add Food Sources'));
    expect(mockOnResourceManipulation).toHaveBeenCalledWith({
      action: 'add_food',
      amount: 10
    });
    
    // Test terrain modification
    await user.click(screen.getByText('⛰️ Raise Terrain'));
    expect(mockOnResourceManipulation).toHaveBeenCalledWith({
      action: 'raise_terrain',
      area: { x: 0, y: 0, radius: 5 }
    });
  });

  it('disables controls when simulation is not running', () => {
    render(<EnvironmentalControls {...defaultProps} isSimulationRunning={false} />);
    
    // Climate controls should be disabled - get first temperature slider
    const temperatureSlider = screen.getAllByDisplayValue('50')[0];
    expect(temperatureSlider).toBeDisabled();
  });

  it('shows correct disaster descriptions', async () => {
    const user = userEvent.setup();
    render(<EnvironmentalControls {...defaultProps} />);
    
    await user.click(screen.getByText('⚡ Disasters'));
    
    // Check default drought description
    expect(screen.getByText('Severe lack of water and food resources')).toBeInTheDocument();
    
    // Change to flood and check description
    const disasterSelect = screen.getByDisplayValue('DROUGHT');
    await user.selectOptions(disasterSelect, 'flood');
    expect(screen.getByText('Excess water causing displacement and resource loss')).toBeInTheDocument();
  });

  it('displays current biome and simulation status', () => {
    render(<EnvironmentalControls {...defaultProps} />);
    
    expect(screen.getByText('Current Biome:')).toBeInTheDocument();
    expect(screen.getByText('FOREST')).toBeInTheDocument();
    expect(screen.getByText(/Active/)).toBeInTheDocument();
  });

  it('shows inactive status when simulation is stopped', () => {
    render(<EnvironmentalControls {...defaultProps} isSimulationRunning={false} />);
    
    expect(screen.getByText(/Inactive/)).toBeInTheDocument();
  });

  it('validates disaster types enum', () => {
    const expectedDisasters = [
      'drought',
      'flood', 
      'volcanic_eruption',
      'meteor_impact',
      'ice_age',
      'heat_wave'
    ];
    
    expect(Object.values(DISASTER_TYPES)).toEqual(expectedDisasters);
  });

  it('validates climate parameters enum', () => {
    const expectedParams = [
      'temperature',
      'humidity',
      'seasonal_intensity'
    ];
    
    expect(Object.values(CLIMATE_PARAMETERS)).toEqual(expectedParams);
  });

  it('handles extreme climate values correctly', async () => {
    const user = userEvent.setup();
    render(<EnvironmentalControls {...defaultProps} />);
    
    // Get the temperature slider specifically (first one)
    const temperatureSlider = screen.getAllByDisplayValue('50')[0];
    fireEvent.change(temperatureSlider, { target: { value: '10' } });
    
    await waitFor(() => {
      expect(screen.getByText('Cold: Slower metabolism, less reproduction')).toBeInTheDocument();
    });
    
    // Test extreme hot temperature
    fireEvent.change(temperatureSlider, { target: { value: '90' } });
    
    await waitFor(() => {
      expect(screen.getByText('Hot: Higher energy drain, faster movement')).toBeInTheDocument();
    });
  });

  it('maintains panel state when switching between tabs', async () => {
    const user = userEvent.setup();
    render(<EnvironmentalControls {...defaultProps} />);
    
    // Modify climate settings - get the temperature slider specifically
    const temperatureSlider = screen.getAllByDisplayValue('50')[0];
    fireEvent.change(temperatureSlider, { target: { value: '75' } });
    
    // Switch to disasters and back
    await user.click(screen.getByText('⚡ Disasters'));
    await user.click(screen.getByText('🌡️ Climate'));
    
    // Temperature should still be 75
    expect(screen.getByDisplayValue('75')).toBeInTheDocument();
  });
});