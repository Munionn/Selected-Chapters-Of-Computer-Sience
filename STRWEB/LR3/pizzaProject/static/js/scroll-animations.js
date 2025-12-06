/**
 * Scroll Animations
 * Parallax effect for pizza section
 */

// Parallax Pizza Effect
function initParallaxPizza() {
    const pizzaLeft = document.querySelector('#pizza_left');
    const pizzaRight = document.querySelector('#pizza_right');
    const pizzaCenter = document.querySelector('#pizza_center');
    const pizzaText = document.querySelector('#pizza_text');
    const pizzaBg = document.querySelector('#pizza_bg');
    
    if (!pizzaLeft || !pizzaRight || !pizzaCenter || !pizzaText) return;
    
    window.addEventListener('scroll', () => {
        let value = window.scrollY;
        const parallaxSection = document.querySelector('#pizza-parallax-top');
        if (!parallaxSection) return;
        
        const sectionRect = parallaxSection.getBoundingClientRect();
        const sectionTop = sectionRect.top + window.scrollY;
        const sectionHeight = parallaxSection.offsetHeight;
        
        // Only animate when section is in view
        if (value >= sectionTop - window.innerHeight && value <= sectionTop + sectionHeight) {
            const relativeValue = value - (sectionTop - window.innerHeight);
            
            // Pizza left - moves left and rotates clockwise
            pizzaLeft.style.left = `-${relativeValue / 0.7}px`;
            pizzaLeft.style.transform = `rotate(${relativeValue * 0.5}deg)`;
            
            // Pizza right - moves right and rotates counter-clockwise
            pizzaRight.style.right = `-${relativeValue / 0.7}px`;
            pizzaRight.style.transform = `rotate(-${relativeValue * 0.5}deg)`;
            
            // Pizza center - moves up and rotates
            pizzaCenter.style.bottom = `${10 + relativeValue * 0.3}%`;
            pizzaCenter.style.transform = `translateX(-50%) rotate(${relativeValue * 0.3}deg)`;
            
            // Text moves down
            pizzaText.style.bottom = `-${relativeValue}px`;
            
            // Background moves slower
            if (pizzaBg) {
                pizzaBg.style.transform = `translateY(${relativeValue * 0.2}px)`;
            }
        }
    }, { passive: true });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initParallaxPizza();
});

