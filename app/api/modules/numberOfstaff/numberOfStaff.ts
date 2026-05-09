const nunmber_of_staff = (grand_total_man_hours: number, available_annual_hours: number, use_factor: number) => {
    return grand_total_man_hours / (available_annual_hours * use_factor);
}

export default nunmber_of_staff